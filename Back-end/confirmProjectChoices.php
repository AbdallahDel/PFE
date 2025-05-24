<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
        'message' => 'You must be logged in to confirm project'
    ]);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$choiceId = $data['choiceId'] ?? null;

// Validate input
if (!$choiceId) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Choice ID is required'
    ]);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Get the binome_id for the current user
    $query_binome = "
        SELECT binome_id 
        FROM students 
        WHERE userID = ?
    ";
    
    $stmt_binome = $conn->prepare($query_binome);
    $stmt_binome->bind_param("i", $user_id);
    $stmt_binome->execute();
    $result_binome = $stmt_binome->get_result();
    
    if ($result_binome->num_rows === 0) {
        throw new Exception("Student not found or not associated with a binome");
    }
    
    $row_binome = $result_binome->fetch_assoc();
    $binome_id = $row_binome['binome_id'];
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Verify that the choice belongs to this binome and has 'accepted by supervisor' status
    $query_check = "
        SELECT id, project_id, status
        FROM project_choices
        WHERE id = ? AND binome_id = ? AND status = 'accepted by supervisor'
    ";
    
    $stmt_check = $conn->prepare($query_check);
    $stmt_check->bind_param("ii", $choiceId, $binome_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception("Invalid choice ID or project not accepted by supervisor");
    }
    
    $choice = $result_check->fetch_assoc();
    $project_id = $choice['project_id'];
    
    // Update the choice status to confirmed
    $update_query = "
        UPDATE project_choices
        SET status = 'confirmed', confirmed_at = NOW()
        WHERE id = ?
    ";
    
    $stmt_update = $conn->prepare($update_query);
    $stmt_update->bind_param("i", $choiceId);
    $stmt_update->execute();
    
    // Update binome record with the project_id
    $update_binome = "
        UPDATE binomes
        SET project_id = ?
        WHERE binome_id = ?
    ";
    
    $stmt_binome_update = $conn->prepare($update_binome);
    $stmt_binome_update->bind_param("ii", $project_id, $binome_id);
    $stmt_binome_update->execute();
    
    // Change status to 'rejected' for all other choices of this binome
    $update_others = "
        UPDATE project_choices
        SET status = 'rejected'
        WHERE binome_id = ? AND id != ?
    ";
    
    $stmt_others = $conn->prepare($update_others);
    $stmt_others->bind_param("ii", $binome_id, $choiceId);
    $stmt_others->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Project confirmed successfully',
        'project_id' => $project_id
    ]);
    
} catch (Exception $e) {
    // Rollback if transaction is active
    if ($conn && $conn->connect_error === null) {
        $conn->rollback();
    }
    
    // Return error message
    error_log("Error in confirmProjectChoice.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}