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

// Get supervisor ID from session
$supervisor_id = $_SESSION['USER_ID'] ?? $_SESSION['user_id'] ?? null;

// Debug info
error_log("Supervisor ID from session: " . ($supervisor_id ?? 'not set'));

if (!$supervisor_id) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'You must be logged in as a supervisor to view assigned projects'
    ]);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // First, verify that the user is actually a supervisor
    $query_supervisor_check = "
        SELECT supervisor_id, nom, prenom 
        FROM supervisors 
        WHERE userID = ?
    ";
    
    $stmt_supervisor_check = $conn->prepare($query_supervisor_check);
    $stmt_supervisor_check->bind_param("i", $supervisor_id);
    $stmt_supervisor_check->execute();
    $result_supervisor_check = $stmt_supervisor_check->get_result();
    
    if ($result_supervisor_check->num_rows === 0) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Access denied. You are not registered as a supervisor.'
        ]);
        exit();
    }
    
    $supervisor_data = $result_supervisor_check->fetch_assoc();
    $actual_supervisor_id = $supervisor_data['supervisor_id'];
    
    // Get all projects created by this supervisor that have been assigned to binomes
    $query_projects = "
        SELECT DISTINCT p.project_id, p.title, p.description, p.type, p.niveau, p.Etat, 
               p.file_path, p.mots_cles, p.environnement, p.contenu,
               p.supervisor_id
        FROM projects p
        INNER JOIN binomes b ON p.project_id = b.project_id
        WHERE p.supervisor_id = ? AND b.project_id IS NOT NULL
        ORDER BY p.title ASC
    ";
    
    $stmt_projects = $conn->prepare($query_projects);
    $stmt_projects->bind_param("i", $actual_supervisor_id);
    $stmt_projects->execute();
    $result_projects = $stmt_projects->get_result();
    
    $projects = [];
    
    while ($project = $result_projects->fetch_assoc()) {
        // For each project, get all binomes assigned to it
        $query_binomes = "
            SELECT DISTINCT b.binome_id
            FROM binomes b
            WHERE b.project_id = ?
        ";
        
        $stmt_binomes = $conn->prepare($query_binomes);
        $stmt_binomes->bind_param("i", $project['project_id']);
        $stmt_binomes->execute();
        $result_binomes = $stmt_binomes->get_result();
        
        $binomes = [];
        
        while ($binome = $result_binomes->fetch_assoc()) {
            // For each binome, get all its members
            $query_members = "
                SELECT s.userID, s.nom, s.prenom, s.matricule, u.Email
                FROM students s
                JOIN user u ON s.userID = u.userID
                WHERE s.binome_id = ?
                ORDER BY s.nom ASC, s.prenom ASC
            ";
            
            $stmt_members = $conn->prepare($query_members);
            $stmt_members->bind_param("i", $binome['binome_id']);
            $stmt_members->execute();
            $result_members = $stmt_members->get_result();
            
            $members = [];
            while ($member = $result_members->fetch_assoc()) {
                $members[] = $member;
            }
            
            // Only add binome if it has members
            if (!empty($members)) {
                $binomes[] = [
                    'binome_id' => $binome['binome_id'],
                    'members' => $members
                ];
            }
        }
        
        // Only add project if it has assigned binomes
        if (!empty($binomes)) {
            $project['binomes'] = $binomes;
            $projects[] = $project;
        }
    }
    
    // Return success response with projects and their assigned binomes
    echo json_encode([
        'status' => 'success',
        'projects' => $projects,
        'supervisor_info' => [
            'supervisor_id' => $actual_supervisor_id,
            'name' => $supervisor_data['nom'] . ' ' . $supervisor_data['prenom']
        ]
    ]);
    
} catch (Exception $e) {
    // Return error message
    error_log("Error in getSupervisorAssignedProjects.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

// Close prepared statements
if (isset($stmt_supervisor_check)) $stmt_supervisor_check->close();
if (isset($stmt_projects)) $stmt_projects->close();
if (isset($stmt_binomes)) $stmt_binomes->close();
if (isset($stmt_members)) $stmt_members->close();

// Close connection
if (isset($conn)) $conn->close();
?>