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

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Query to get supervisors with less than 5 projects
    $query = "
        SELECT 
            s.supervisor_id,
            s.nom,
            s.prenom,
            CONCAT(s.nom, ' ', s.prenom) as full_name,
            COUNT(p.project_id) as project_count
        FROM 
            supervisors s
        LEFT JOIN 
            projects p ON s.supervisor_id = p.supervisor_id
        GROUP BY 
            s.supervisor_id
        HAVING 
            COUNT(p.project_id) < 5
        ORDER BY 
            s.nom, s.prenom
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $supervisors = [];
    while ($row = $result->fetch_assoc()) {
        $supervisors[] = [
            'id' => $row['supervisor_id'],
            'name' => $row['full_name'],
            'project_count' => $row['project_count']
        ];
    }
    
    echo json_encode([
        'status' => 'success',
        'supervisors' => $supervisors
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>