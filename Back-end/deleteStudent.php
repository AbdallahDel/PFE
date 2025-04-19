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
$studentId = isset($data['id']) ? $data['id'] : null;

if (!isset($studentId) || !is_numeric($studentId)) {
    echo json_encode(["status" => "error", "message" => "Invalid student ID"]);
    exit;
}

// First delete from user table using the userID from student table
$sql = "DELETE u FROM user u 
        INNER JOIN student s ON s.userID = u.userID 
        WHERE s.studentID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $studentId);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Student deleted successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error deleting student: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>