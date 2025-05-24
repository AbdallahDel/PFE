<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    if (!isset($data['id']) || empty($data['id'])) {
        throw new Exception("Subject ID is required");
    }
    
    $sujetID = $data['id'];
    
    // Start transaction
    $conn->begin_transaction();
    
    // Get binome_id first
    $getBinomeQuery = $conn->prepare("SELECT binome_id FROM projects WHERE project_id = ?");
    $getBinomeQuery->bind_param("i", $sujetID);
    $getBinomeQuery->execute();
    $result = $getBinomeQuery->get_result();
    $binome_id = null;
    
    if ($row = $result->fetch_assoc()) {
        $binome_id = $row['binome_id'];
    }
    
    // Delete project files if they exist
    $fileQuery = $conn->prepare("SELECT file_path FROM projects WHERE project_id = ? AND file_path IS NOT NULL");
    $fileQuery->bind_param("i", $sujetID);
    $fileQuery->execute();
    $fileResult = $fileQuery->get_result();
    
    if ($fileRow = $fileResult->fetch_assoc()) {
        $filePath = $fileRow['file_path'];
        if (!empty($filePath) && file_exists($filePath)) {
            unlink($filePath);
        }
    }
    
    // Delete project
    $deleteQuery = $conn->prepare("DELETE FROM projects WHERE project_id = ?");
    $deleteQuery->bind_param("i", $sujetID);
    
    if (!$deleteQuery->execute()) {
        throw new Exception("Failed to delete subject: " . $deleteQuery->error);
    }
    
    // Delete team members if binome_id exists
    if ($binome_id) {
        $deleteStudentsQuery = $conn->prepare("DELETE FROM students WHERE binome_id = ?");
        $deleteStudentsQuery->bind_param("i", $binome_id);
        $deleteStudentsQuery->execute();
        
        // Delete binome
        $deleteBinomeQuery = $conn->prepare("DELETE FROM binomes WHERE binome_id = ?");
        $deleteBinomeQuery->bind_param("i", $binome_id);
        $deleteBinomeQuery->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Subject deleted successfully'
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