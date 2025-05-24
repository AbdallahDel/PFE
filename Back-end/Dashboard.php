<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// For debugging: Log session info
error_log("Session data: " . print_r($_SESSION, true));

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Start the session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Debug: Print all session variables
error_log("All session vars: " . print_r($_SESSION, true));

// Check if user is logged in - accept either userID or user_id
if (!isset($_SESSION['userID']) && !isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
    exit();
}

// Use whichever session variable is set
$user_id = isset($_SESSION['userID']) ? $_SESSION['userID'] : $_SESSION['user_id'];

// Debug: Print the user ID we're using
error_log("Using user ID: " . $user_id);

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Query to get basic supervisor information for the welcome page
    $query = "
        SELECT 
            s.supervisor_id,
            s.userID,
            s.nom,
            s.prenom,
            s.Grade as grade,
            (SELECT COUNT(*) FROM projects WHERE supervisor_id = s.supervisor_id) as project_count,
            (SELECT COUNT(*) FROM students st 
             JOIN projects p ON st.project_id = p.project_id 
             WHERE p.supervisor_id = s.supervisor_id) as student_count
        FROM 
            supervisors s
        WHERE 
            s.userID = ?
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    if ($result->num_rows === 0) {
        // For debugging: Log that no supervisor was found
        error_log("No supervisor found for user ID: " . $user_id);
        
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Supervisor not found']);
        exit();
    }
    
    $supervisor = $result->fetch_assoc();
    
    // Success - return the supervisor data
    echo json_encode([
        'status' => 'success',
        'supervisor' => $supervisor
    ]);
    
} catch (Exception $e) {
    error_log("Error in Dashboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>