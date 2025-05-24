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
        'message' => 'You must be logged in to view your assigned project'
    ]);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // First get the binome_id for the current user
    $query_binome = "
        SELECT b.binome_id, b.project_id
        FROM students s
        JOIN binomes b ON s.binome_id = b.binome_id
        WHERE s.userID = ?
    ";
    
    $stmt_binome = $conn->prepare($query_binome);
    $stmt_binome->bind_param("i", $user_id);
    $stmt_binome->execute();
    $result_binome = $stmt_binome->get_result();
    
    if ($result_binome->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Student not found or not associated with a binome'
        ]);
        exit();
    }
    
    $row_binome = $result_binome->fetch_assoc();
    $binome_id = $row_binome['binome_id'];
    $project_id = $row_binome['project_id'];
    
    // If no project is assigned yet
    if (empty($project_id)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'No project assigned yet',
            'project' => null,
            'binomeMembers' => []
        ]);
        exit();
    }
    
    // Get project details with supervisor info
    $query_project = "
        SELECT p.project_id, p.title, p.description, p.type, p.niveau, p.Etat, 
               p.file_path, p.mots_cles, p.environnement, p.contenu,
               CONCAT(s.nom, ' ', s.prenom) as supervisor_name
        FROM projects p
        LEFT JOIN supervisors s ON p.supervisor_id = s.supervisor_id
        WHERE p.project_id = ?
    ";
    
    $stmt_project = $conn->prepare($query_project);
    $stmt_project->bind_param("i", $project_id);
    $stmt_project->execute();
    $result_project = $stmt_project->get_result();
    
    if ($result_project->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Project not found'
        ]);
        exit();
    }
    
    $project = $result_project->fetch_assoc();
    
    // Get binome members info
    $query_members = "
        SELECT s.userID, s.nom, s.prenom, s.matricule, u.Email
        FROM students s
        JOIN user u ON s.userID = u.userID
        WHERE s.binome_id = ?
    ";
    
    $stmt_members = $conn->prepare($query_members);
    $stmt_members->bind_param("i", $binome_id);
    $stmt_members->execute();
    $result_members = $stmt_members->get_result();
    
    $binomeMembers = [];
    while ($member = $result_members->fetch_assoc()) {
        $binomeMembers[] = $member;
    }
    
    // Return success response with project and binome data
    echo json_encode([
        'status' => 'success',
        'project' => $project,
        'binomeMembers' => $binomeMembers
    ]);
    
} catch (Exception $e) {
    // Return error message
    error_log("Error in getAssignedProject.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}