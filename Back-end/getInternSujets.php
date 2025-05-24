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

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Query to get ALL approved internal projects with selection count
    $query = "
        SELECT 
            p.project_id,
            p.title,
            p.description,
            p.niveau,
            p.created_at,
            p.file_path,
            CONCAT(s.nom, ' ', s.prenom) as encadrant,
            (SELECT COUNT(*) FROM binomes WHERE project_id = p.project_id) AS selection_count
        FROM 
            projects p
        JOIN 
            supervisors s ON p.supervisor_id = s.supervisor_id
        WHERE 
            p.Etat = 'approved' 
            AND p.type = 'intern'
        ORDER BY 
            p.created_at DESC
    ";
    
    // Execute the query
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Fetch results into an array
    $themes = [];
    while ($row = $result->fetch_assoc()) {
        // Add the selection count to the theme data
        $row['selection_count'] = (int)$row['selection_count'];
        $themes[] = $row;
    }
    
    // Debug: Output the number of results found
    error_log("Found " . count($themes) . " approved internal projects");
    
    // Get the student's chosen project IDs (if logged in)
    $student_choices = [];
    if ($user_id) {
        // First get the binome_id
        $query_binome = "
            SELECT binome_id 
            FROM students 
            WHERE userID = ?
        ";
        
        $stmt_binome = $conn->prepare($query_binome);
        $stmt_binome->bind_param("i", $user_id);
        $stmt_binome->execute();
        $result_binome = $stmt_binome->get_result();
        
        if ($row_binome = $result_binome->fetch_assoc()) {
            $binome_id = $row_binome['binome_id'];
            
            // Get project IDs chosen by this binome
            $query_choices = "
                SELECT project_id
                FROM binomes
                WHERE binome_id = ?
            ";
            
            $stmt_choices = $conn->prepare($query_choices);
            $stmt_choices->bind_param("i", $binome_id);
            $stmt_choices->execute();
            $result_choices = $stmt_choices->get_result();
            
            while ($row = $result_choices->fetch_assoc()) {
                $student_choices[] = (int)$row['project_id'];
            }
        }
    }
    
    // Return the results as JSON
    echo json_encode([
        'status' => 'success',
        'themes' => $themes,
        'student_choices' => $student_choices
    ]);
    
} catch (Exception $e) {
    // Return error message with more details
    error_log("Error in getInternSujet.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>