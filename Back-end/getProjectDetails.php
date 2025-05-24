<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin:http://localhost:3000"); // Change this to be more specific in production
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session for consistency with other endpoints
session_start();

// Get POST data with error handling
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);
$projectIds = $data['projectIds'] ?? [];

// Debug logging
error_log("Raw input: " . $raw_data);
error_log("Decoded projectIds: " . print_r($projectIds, true));

// Validate input
if (empty($projectIds) || !is_array($projectIds)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'No project IDs provided or invalid format'
    ]);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Prepare statement with placeholders for safety
    $placeholders = implode(',', array_fill(0, count($projectIds), '?'));
    
    // Get project details
    $query = "
        SELECT p.project_id, p.title, p.description, p.niveau, p.file_path, 
               CONCAT(s.nom, ' ', s.prenom) as encadrant,
               p.created_at
        FROM projects p
        LEFT JOIN supervisors s ON p.supervisor_id = s.supervisor_id
        WHERE p.project_id IN ($placeholders)
    ";
    
    $stmt = $conn->prepare($query);
    
    // Bind parameters dynamically
    if ($stmt) {
        $types = str_repeat('i', count($projectIds)); // 'i' for integer
        $stmt->bind_param($types, ...$projectIds);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
        
        // Return success response
        echo json_encode([
            'status' => 'success',
            'projects' => $projects
        ]);
    } else {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    
} catch (Exception $e) {
    // Return error message
    error_log("Error in getProjectDetails.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>