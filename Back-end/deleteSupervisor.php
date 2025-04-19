<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$supervisorId = isset($data['id']) ? $data['id'] : null;

if (!isset($supervisorId) || !is_numeric($supervisorId)) {
    echo json_encode(["status" => "error", "message" => "Invalid supervisor ID"]);
    exit;
}

// Start transaction since we need to update multiple tables
$conn->begin_transaction();

try {
    // Update teams to remove this supervisor
    $sql1 = "UPDATE team SET supervisorID = NULL WHERE supervisorID = ?";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("i", $supervisorId);
    $stmt1->execute();
    
    // Update projects to remove this supervisor
    $sql2 = "UPDATE project SET supervisorID = NULL WHERE supervisorID = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $supervisorId);
    $stmt2->execute();
    
    // Delete from user table using the userID from supervisor table
    $sql3 = "DELETE u FROM user u 
            INNER JOIN supervisor s ON s.userID = u.userID 
            WHERE s.supervisorID = ?";
    $stmt3 = $conn->prepare($sql3);
    $stmt3->bind_param("i", $supervisorId);
    $stmt3->execute();
    
    // If all queries successful, commit transaction
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Supervisor deleted successfully']);
    
} catch (Exception $e) {
    // If any query fails, rollback all changes
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Error deleting supervisor: ' . $e->getMessage()]);
}

$conn->close();
?>