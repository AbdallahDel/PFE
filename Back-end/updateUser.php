<?php
include 'connexion.php'; // or require 'connection.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

session_start();

$data = json_decode(file_get_contents("php://input"), true);


if (!isset($data['userID']) || !is_numeric($data['userID'])) {
    echo json_encode(["status" => "error", "message" => "Invalid user ID"]);
    exit;
}





//update the user info 

$sql = "UPDATE user SET

userName = ?,
Email =?,
PhoneNumber = ?,
Role =?

 WHERE userID = ?";


$stmt = $conn->prepare($sql);
$stmt->bind_param("ssisi", 
$data['userName'],
$data['Email'],
$data['PhoneNumber'],
$data['Role'],
$data['userID']

); // Use "i" for integer 

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'User Edited successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error Editing user: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>