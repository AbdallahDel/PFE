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

// Start session for consistency with other endpoints
session_start();

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Get list of projects that are already confirmed/selected
    // This query finds project IDs that are either:
    // 1. Assigned to binomes in the binomes table
    // 2. Have a 'confirmed' status in project_choices
    $query = "
        SELECT DISTINCT p.project_id
        FROM projects p
        WHERE 
            p.project_id IN (SELECT project_id FROM binomes WHERE project_id IS NOT NULL)
            OR
            p.project_id IN (SELECT project_id FROM project_choices WHERE status = 'confirmed')
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $projects = [];
    while ($row = $result->fetch_assoc()) {
        $projects[] = (int)$row['project_id']; // Cast to integer for consistency
    }
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'projects' => $projects
    ]);
    
} catch (Exception $e) {
    // Return error message
    error_log("Error in getAlreadySelectedProjects.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}