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
        'message' => 'User not logged in'
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
    
    // Get the choices for this binome
    $query_choices = "
        SELECT id, project_id, status,submitted_at
        FROM project_choices
        WHERE binome_id = ?
        ORDER BY id ASC
    ";
    
    $stmt_choices = $conn->prepare($query_choices);
    $stmt_choices->bind_param("i", $binome_id);
    $stmt_choices->execute();
    $result_choices = $stmt_choices->get_result();
    
    $choices = [];
    while ($row = $result_choices->fetch_assoc()) {
        $choices[] = $row;
    }
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'choices' => $choices,
        'binome_id' => $binome_id
    ]);
    
} catch (Exception $e) {
    // Return error message
    error_log("Error in getUserChoices.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}