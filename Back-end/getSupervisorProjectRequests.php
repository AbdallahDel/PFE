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
        'message' => 'You must be logged in to view project requests'
    ]);
    exit();
}

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
    
    // Get all project requests for this supervisor's projects
    $query_requests = "
        SELECT 
            pc.id AS choice_id,
            pc.binome_id,
            pc.project_id,
            pc.status,
            p.created_at AS submitted_at,
            p.title AS project_title,
            p.niveau,
            (
                SELECT GROUP_CONCAT(CONCAT(s.nom, ' ', s.prenom) SEPARATOR ', ')
                FROM students s
                WHERE s.binome_id = pc.binome_id
            ) AS student_names,
            (
                SELECT matricule
                FROM students
                WHERE binome_id = pc.binome_id
                LIMIT 1
            ) AS matricule
        FROM 
            project_choices pc
        JOIN 
            projects p ON pc.project_id = p.project_id
        WHERE 
            p.supervisor_id = ?
        ORDER BY 
            p.title ASC, p.created_at DESC
    ";
    
    $stmt_requests = $conn->prepare($query_requests);
    $stmt_requests->bind_param("i", $supervisor_id);
    $stmt_requests->execute();
    $result_requests = $stmt_requests->get_result();
    
    $requests = [];
    while ($row = $result_requests->fetch_assoc()) {
        $requests[] = $row;
    }
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'requests' => $requests
    ]);
    
} catch (Exception $e) {
    // Return error message
    error_log("Error in getSupervisorProjectRequests.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}