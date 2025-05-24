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

// Start session to get user ID
session_start();

// Get user ID from session
$user_id = $_SESSION['USER_ID'] ?? $_SESSION['user_id'] ?? null;

// Debug info
error_log("User ID from session: " . ($user_id ?? 'not set'));

if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'You must be logged in to reject project requests'
    ]);
    exit();
}

// Get the request body
$data = json_decode(file_get_contents('php://input'), true);

// Check if choiceId is provided
if (!isset($data['choiceId']) || empty($data['choiceId'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Project choice ID is required'
    ]);
    exit();
}

$choice_id = $data['choiceId'];

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Verify if user is a supervisor
    $query_supervisor = "
        SELECT supervisor_id 
        FROM supervisors 
        WHERE userID = ?
    ";
    
    $stmt_supervisor = $conn->prepare($query_supervisor);
    $stmt_supervisor->bind_param("i", $user_id);
    $stmt_supervisor->execute();
    $result_supervisor = $stmt_supervisor->get_result();
    
    if ($result_supervisor->num_rows === 0) {
        throw new Exception("User is not a supervisor");
    }
    
    $row_supervisor = $result_supervisor->fetch_assoc();
    $supervisor_id = $row_supervisor['supervisor_id'];
    
    // Verify that the project belongs to this supervisor
    $query_verify = "
        SELECT pc.id, p.supervisor_id, pc.status
        FROM project_choices pc
        JOIN projects p ON pc.project_id = p.project_id
        WHERE pc.id = ?
    ";
    
    $stmt_verify = $conn->prepare($query_verify);
    $stmt_verify->bind_param("i", $choice_id);
    $stmt_verify->execute();
    $result_verify = $stmt_verify->get_result();
    
    if ($result_verify->num_rows === 0) {
        throw new Exception("Project choice not found");
    }
    
    $row_verify = $result_verify->fetch_assoc();
    
    // Check if the project belongs to this supervisor
    if ($row_verify['supervisor_id'] != $supervisor_id) {
        throw new Exception("You don't have permission to reject this request");
    }
    
    // Check if the request is still pending or was already accepted by supervisor (but not yet confirmed)
    if ($row_verify['status'] !== 'en attente' && $row_verify['status'] !== 'accepted by supervisor') {
        throw new Exception("This request cannot be rejected because its current status is '" . $row_verify['status'] . "'");
    }
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Update the status to 'rejected'
    $query_update = "
        UPDATE project_choices
        SET status = 'rejected'
        WHERE id = ?
    ";
    
    $stmt_update = $conn->prepare($query_update);
    $stmt_update->bind_param("i", $choice_id);
    $result_update = $stmt_update->execute();
    
    if (!$result_update) {
        // Rollback if the update fails
        $conn->rollback();
        throw new Exception("Failed to update project choice status");
    }
    
    // Commit the transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Project request rejected successfully.'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction if still active
    if (isset($conn) && $conn->connect_error === false) {
        $conn->rollback();
    }
    
    // Return error message
    error_log("Error in rejectProjectRequest.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}