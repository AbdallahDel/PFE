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

// Start session to get supervisor ID
session_start();

// Debug session data
error_log("Session contents: " . print_r($_SESSION, true));

// Get user ID from session
$user_id = $_SESSION['USER_ID'] ?? $_SESSION['user_id'] ?? null;

// Debug info
error_log("User ID from session: " . ($user_id ?? 'not set'));

// First, get the supervisor_id that corresponds to this user_id
$supervisor_id = null;
if ($user_id) {
    $query_supervisor = "SELECT supervisor_id FROM supervisors WHERE userID = ?";
    $stmt_supervisor = $conn->prepare($query_supervisor);
    $stmt_supervisor->bind_param("i", $user_id);
    $stmt_supervisor->execute();
    $result_supervisor = $stmt_supervisor->get_result();
    
    if ($result_supervisor && $result_supervisor->num_rows > 0) {
        $supervisor_data = $result_supervisor->fetch_assoc();
        $supervisor_id = $supervisor_data['supervisor_id'];
        error_log("Found supervisor_id: $supervisor_id for user_id: $user_id");
    }
}

// Fallback for testing - Remove in production
if (!$supervisor_id) {
    error_log("No supervisor_id found, using fallback for testing");
    $supervisor_id = 38; // Fallback for testing
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    if (!$supervisor_id) {
        throw new Exception("Supervisor not logged in or session missing");
    }

    // Debug information
    error_log("Using Supervisor ID: $supervisor_id");
    
    // Query to get supervisor's projects with binome choice count
    // Modified to ensure we get ALL projects for this supervisor regardless of binome choices
    $query = "
        SELECT 
            p.project_id AS id,
            p.title,
            p.description,
            p.niveau,
            p.Etat,
            p.created_at,
            COUNT(b.binome_id) AS choix_count
        FROM 
            projects p
        LEFT JOIN 
            binomes b ON p.project_id = b.project_id
        WHERE 
            p.supervisor_id = ?
        GROUP BY 
            p.project_id, p.title, p.description, p.niveau, p.Etat, p.created_at
        ORDER BY 
            p.created_at DESC
    ";
    
    // Prepare and execute the query
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $supervisor_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Fetch results into an array
    $subjects = [];
    while ($row = $result->fetch_assoc()) {
        $subjects[] = $row;
    }
    
    // Debug: Output the number of results found
    error_log("Found " . count($subjects) . " projects for supervisor ID: $supervisor_id");
    
    // Return the results as JSON
    echo json_encode([
        'status' => 'success',
        'subjects' => $subjects,
        'debug' => [
            'supervisor_id' => $supervisor_id,
            'query' => $query,
            'result_count' => count($subjects)
        ]
    ]);
    
} catch (Exception $e) {
    // Return error message with more details
    error_log("Error in supervisor projects query: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage(),
        'supervisor_id' => $supervisor_id ?? 'not set'
    ]);
}
?>