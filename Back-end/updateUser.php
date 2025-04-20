<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['userID'])) {
    echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
    exit;
}

try {
    // Update username
    $sql = "UPDATE user SET userName = ? WHERE userID = ? AND Role = 'admin'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $data['userName'], $data['userID']);
    $stmt->execute();

    echo json_encode(['status' => 'success', 'message' => 'User updated successfully']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error updating user: ' . $e->getMessage()]);
}

$conn->close();
?>