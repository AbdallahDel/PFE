<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Get the request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if the ID is provided
    if (!isset($data['sujetID']) || empty($data['sujetID'])) {
        throw new Exception("Subject ID is required");
    }
    
    $sujetID = $data['sujetID'];
    $titre = $data['titre'] ?? null;
    $etat = $data['etat'] ?? null;
    $description = $data['description'] ?? null;
    $encadrant = $data['encadrant'] ?? null;
    
    // Start transaction
    $conn->begin_transaction();
    
    // Handle supervisor update if provided
    if ($encadrant !== null) {
        // Parse supervisor name
        $nameParts = explode(' ', $encadrant, 2);
        $nom = $nameParts[0] ?? '';
        $prenom = $nameParts[1] ?? '';
        
        // Find or create supervisor
        $supervisor_id = null;
        $supervisorCheck = $conn->prepare("SELECT supervisor_id FROM supervisors WHERE CONCAT(nom, ' ', prenom) = ?");
        $supervisorCheck->bind_param("s", $encadrant);
        $supervisorCheck->execute();
        $supervisorResult = $supervisorCheck->get_result();
        
        if ($supervisorResult->num_rows > 0) {
            $supervisor = $supervisorResult->fetch_assoc();
            $supervisor_id = $supervisor['supervisor_id'];
        } else {
            // Insert new supervisor if not found
            $supervisorInsert = $conn->prepare("INSERT INTO supervisors (nom, prenom) VALUES (?, ?)");
            $supervisorInsert->bind_param("ss", $nom, $prenom);
            $supervisorInsert->execute();
            $supervisor_id = $conn->insert_id;
        }
        
        // Update project with new supervisor_id
        $updateSupervisor = $conn->prepare("UPDATE projects SET supervisor_id = ? WHERE project_id = ?");
        $updateSupervisor->bind_param("ii", $supervisor_id, $sujetID);
        if (!$updateSupervisor->execute()) {
            throw new Exception("Failed to update supervisor: " . $updateSupervisor->error);
        }
    }
    
    // Map etat to database values if it exists
    $dbEtat = null;
    if ($etat !== null) {
        if ($etat === 'proposed') {
            $dbEtat = 'proposed';
        } else if ($etat === 'approved') {
            $dbEtat = 'approved';
        } else if ($etat === 'rejected') {
            $dbEtat = 'rejected';
        }
    }
    
    // Build update query for projects table - only allow title, state, description to be updated
    $updates = [];
    $types = "";
    $params = [];
    
    if ($titre !== null) {
        $updates[] = "title = ?";
        $types .= "s";
        $params[] = $titre;
    }
    
    if ($dbEtat !== null) {
        $updates[] = "Etat = ?";
        $types .= "s";
        $params[] = $dbEtat;
    }
    
    if ($description !== null) {
        $updates[] = "description = ?";
        $types .= "s";
        $params[] = $description;
    }
    
    // Only update if there are changes
    if (!empty($updates)) {
        $updateQuery = "UPDATE projects SET " . implode(", ", $updates) . " WHERE project_id = ?";
        $types .= "i";
        $params[] = $sujetID;
        
        $stmt = $conn->prepare($updateQuery);
        
        // Bind parameters dynamically
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update subject: " . $stmt->error);
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Subject updated successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction if there was an error
    if (isset($conn) && $conn !== null) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>