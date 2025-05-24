<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Get the request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if required fields are provided
    if (!isset($data['id']) || empty($data['id'])) {
        throw new Exception("Subject ID is required");
    }
    
    if (!isset($data['status']) || empty($data['status'])) {
        throw new Exception("Status is required");
    }
    
    $sujetID = $data['id'];
    $status = $data['status'];
    
    // Convert status to database value
    $dbStatus = '';
    if ($status === 'approved') {
        $dbStatus = 'approved';
    } elseif ($status === 'rejected') {
        $dbStatus = 'rejected';
    } else {
        throw new Exception("Invalid status value");
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // First, check if this is an external project
    $checkTypeQuery = "SELECT type FROM projects WHERE project_id = ?";
    $stmt_check = $conn->prepare($checkTypeQuery);
    $stmt_check->bind_param("i", $sujetID);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception("Project not found");
    }
    
    $project_data = $result_check->fetch_assoc();
    $project_type = $project_data['type'];
    
    // Update the project status in the database
    $stmt = $conn->prepare("UPDATE projects SET Etat = ? WHERE project_id = ?");
    $stmt->bind_param("si", $dbStatus, $sujetID);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update project status: " . $stmt->error);
    }
    
    $binome_assigned = false;
    $assigned_binome_id = null;
    
    // If this is an external project and it's being approved, handle binome assignment
    if ($project_type === 'extern' && $dbStatus === 'approved') {
        // Update the project_choices table status to 'validated'
        $updateChoicesQuery = "UPDATE project_choices SET status = 'validated' WHERE project_id = ?";
        $stmt_choices = $conn->prepare($updateChoicesQuery);
        $stmt_choices->bind_param("i", $sujetID);
        
        if (!$stmt_choices->execute()) {
            throw new Exception("Failed to update project choices status: " . $stmt_choices->error);
        }
        
        error_log("Updated project_choices status to 'validated' for external project ID: $sujetID");
        
        // Find the binome that chose this external project and assign it
        $findBinomeQuery = "
            SELECT binome_id 
            FROM project_choices 
            WHERE project_id = ? AND status = 'validated'
            LIMIT 1
        ";
        
        $stmt_binome_find = $conn->prepare($findBinomeQuery);
        $stmt_binome_find->bind_param("i", $sujetID);
        $stmt_binome_find->execute();
        $result_binome = $stmt_binome_find->get_result();
        
        if ($result_binome->num_rows > 0) {
            $binome_data = $result_binome->fetch_assoc();
            $binome_id = $binome_data['binome_id'];
            
            // Assign the project to the binome
            $updateBinomeQuery = "UPDATE binomes SET project_id = ? WHERE binome_id = ?";
            $stmt_binome_update = $conn->prepare($updateBinomeQuery);
            $stmt_binome_update->bind_param("ii", $sujetID, $binome_id);
            
            if (!$stmt_binome_update->execute()) {
                throw new Exception("Failed to assign project to binome: " . $stmt_binome_update->error);
            }
            
            // Mark other choices for this binome as rejected
            $rejectOtherChoicesQuery = "
                UPDATE project_choices 
                SET status = 'rejected' 
                WHERE binome_id = ? AND project_id != ?
            ";
            
            $stmt_reject_others = $conn->prepare($rejectOtherChoicesQuery);
            $stmt_reject_others->bind_param("ii", $binome_id, $sujetID);
            $stmt_reject_others->execute();
            
            $binome_assigned = true;
            $assigned_binome_id = $binome_id;
            
            error_log("Assigned external project ID: $sujetID to binome ID: $binome_id");
        }
    } elseif ($project_type === 'extern' && $dbStatus === 'rejected') {
        // If rejecting an external project, just update the choices status
        $updateChoicesQuery = "UPDATE project_choices SET status = 'rejected' WHERE project_id = ?";
        $stmt_choices = $conn->prepare($updateChoicesQuery);
        $stmt_choices->bind_param("i", $sujetID);
        
        if (!$stmt_choices->execute()) {
            throw new Exception("Failed to update project choices status: " . $stmt_choices->error);
        }
        
        error_log("Updated project_choices status to 'rejected' for external project ID: $sujetID");
    }
    
    // Commit transaction
    $conn->commit();
    
    $response_data = [
        'status' => 'success',
        'message' => 'Subject status updated successfully',
        'new_status' => $dbStatus,
        'project_type' => $project_type
    ];
    
    // Add additional info if it was an external project
    if ($project_type === 'extern') {
        $response_data['choices_updated'] = true;
        $response_data['choices_status'] = $dbStatus === 'approved' ? 'validated' : 'rejected';
        
        if ($binome_assigned) {
            $response_data['binome_assigned'] = true;
            $response_data['assigned_binome_id'] = $assigned_binome_id;
            $response_data['message'] = 'External project approved and assigned to binome successfully';
        }
    }
    
    echo json_encode($response_data);
    
} catch (Exception $e) {
    // Rollback transaction if it was started
    if ($conn && $conn->connect_error === null) {
        $conn->rollback();
    }
    
    error_log("Error in updateetat: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>