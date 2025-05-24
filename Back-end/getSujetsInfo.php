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

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Query to get all subjects with team members, proper level, status, and type
    $query = "
        SELECT 
            p.project_id AS sujetID,
            p.title AS titre,
            (SELECT GROUP_CONCAT(CONCAT(s.nom, ' ', s.prenom) SEPARATOR ', ') 
             FROM binomes b
             INNER JOIN students s ON b.binome_id = s.binome_id 
             WHERE b.project_id = p.project_id) AS equipe,
            CONCAT(sup.nom, ' ', sup.prenom) AS encadrant,
            p.Etat AS etat,
            p.created_at AS date_soumission,
            p.file_path,
            p.niveau,
            p.type,
            p.description
        FROM 
            projects p
        LEFT JOIN 
            supervisors sup ON p.supervisor_id = sup.supervisor_id
        ORDER BY 
            p.created_at DESC
    ";
    
    // Execute the query
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Fetch results into an array
    $sujets = [];
    while ($row = $result->fetch_assoc()) {
        // Handle null equipe
        if (empty($row['equipe'])) {
            $row['equipe'] = 'No team assigned';
        }
        
        // Add information about file status
        $row['has_file'] = !empty($row['file_path']);
        
        // Add action permissions
        $row['actions'] = [
            'can_view' => !empty($row['file_path']),
            'can_approve' => ($row['etat'] === 'proposed'),
            'can_reject' => ($row['etat'] === 'proposed' || $row['etat'] === 'assigned'),
            'can_edit' => true,  // Admins can edit all projects
            'can_delete' => true  // Admins can delete all projects
        ];
        
        $sujets[] = $row;
    }
    
    // Return the results as JSON
    echo json_encode($sujets);
    
} catch (Exception $e) {
    // Return error message
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>