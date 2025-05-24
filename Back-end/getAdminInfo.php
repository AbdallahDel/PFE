<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

// Check if user is logged in
if (!isset($_SESSION['USER_ID'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in'
    ]);
    exit;
}

$userId = $_SESSION['USER_ID'];

// Get admin information from user table
$sql = "SELECT userID, userName, PhoneNumber, Email, Role
        FROM user 
        WHERE userID = ? AND Role = 'admin'";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $admin = $result->fetch_assoc();
    
    echo json_encode([
        'status' => 'success',
        'admin' => $admin,
        'message' => 'Admin information retrieved successfully'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Admin information not found'
    ]);
}

$stmt->close();
$conn->close();
?>