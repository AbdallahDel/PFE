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

// Get POST data
$oldPassword = $_POST['oldPassword'] ?? '';
$newPassword = $_POST['newPassword'] ?? '';

// Validate input
if (empty($oldPassword) || empty($newPassword)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required'
    ]);
    exit;
}

// Minimum password length
if (strlen($newPassword) < 6) {
    echo json_encode([
        'status' => 'error',
        'message' => 'New password must be at least 6 characters'
    ]);
    exit;
}

$userId = $_SESSION['USER_ID'];

// Get current user password from database
$sql = "SELECT Password FROM user WHERE userID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not found'
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verify old password
if (!password_verify($oldPassword, $user['Password'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Current password is incorrect'
    ]);
    exit;
}

// Hash new password
$hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password in database
$updateSql = "UPDATE user SET Password = ? WHERE userID = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("si", $hashedNewPassword, $userId);
$updateResult = $updateStmt->execute();

if ($updateResult) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Password updated successfully'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update password: ' . $conn->error
    ]);
}

$stmt->close();
$updateStmt->close();
$conn->close();
?>