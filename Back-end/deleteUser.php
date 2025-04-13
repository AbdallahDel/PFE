<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

session_start();

$data = json_decode(file_get_contents("php://input"), true);
$userId = isset($data['id']) ? $data['id'] : null;

if (!isset($userId) || !is_numeric($userId)) {
    echo json_encode(["status" => "error", "message" => "Invalid user ID"]);
    exit;
}

// Connect to the database
$conn = new mysqli('localhost', 'root', '', 'testform');
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// Correct SQL syntax for DELETE
$sql = "DELETE FROM USER WHERE userID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId); // Use "i" for integer

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'User deleted successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error deleting user: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>