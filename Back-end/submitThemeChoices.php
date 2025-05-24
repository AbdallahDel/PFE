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
        'message' => 'You must be logged in to submit choices'
    ]);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$themeIds = $data['themeIds'] ?? [];

// Validate input
if (empty($themeIds) || count($themeIds) > 3) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'You must select between 1 and 3 themes'
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
    
    // Check if binome already has any choices submitted (intern or extern)
    $query_check_choices = "
        SELECT COUNT(*) as choice_count 
        FROM project_choices 
        WHERE binome_id = ?
    ";
    
    $stmt_check_choices = $conn->prepare($query_check_choices);
    $stmt_check_choices->bind_param("i", $binome_id);
    $stmt_check_choices->execute();
    $result_check_choices = $stmt_check_choices->get_result();
    $row_check_choices = $result_check_choices->fetch_assoc();
    
    if ($row_check_choices['choice_count'] > 0) {
        throw new Exception("Your binome already has submitted choices. Cannot submit new choices.");
    }
    
    // Check if binome already has a project_id assigned
    $query_check_project = "
        SELECT project_id 
        FROM binomes 
        WHERE binome_id = ? AND project_id IS NOT NULL
    ";
    
    $stmt_check_project = $conn->prepare($query_check_project);
    $stmt_check_project->bind_param("i", $binome_id);
    $stmt_check_project->execute();
    $result_check_project = $stmt_check_project->get_result();
    
    if ($result_check_project->num_rows > 0) {
        throw new Exception("Your binome already has a project assigned. Cannot submit new choices.");
    }
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Delete any existing choices for this binome
    $delete_query = "DELETE FROM project_choices WHERE binome_id = ?";
    $stmt_delete = $conn->prepare($delete_query);
    $stmt_delete->bind_param("i", $binome_id);
    $stmt_delete->execute();
    
    // Insert new choices
    $insert_query = "
        INSERT INTO project_choices (binome_id, project_id, status, submitted_at) 
        VALUES (?, ?, 'en attente', NOW())
    ";
    
    $stmt_insert = $conn->prepare($insert_query);
    
    foreach ($themeIds as $project_id) {
        // Get supervisor_id for this project
        $query_supervisor = "SELECT supervisor_id FROM projects WHERE project_id = ?";
        $stmt_supervisor = $conn->prepare($query_supervisor);
        $stmt_supervisor->bind_param("i", $project_id);
        $stmt_supervisor->execute();
        $result_supervisor = $stmt_supervisor->get_result();
        
        if ($result_supervisor->num_rows === 0) {
            throw new Exception("Project not found: " . $project_id);
        }
        
        // Insert the choice
        $stmt_insert->bind_param("ii", $binome_id, $project_id);
        $stmt_insert->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Choices submitted successfully',
        'submitted_choices' => $themeIds
    ]);
    
} catch (Exception $e) {
    // Rollback if transaction is active
    if ($conn && $conn->connect_error === null) {
        $conn->rollback();
    }
    
    // Return error message
    error_log("Error in submitThemeChoices.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>