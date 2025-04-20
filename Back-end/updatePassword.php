<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

try {
    // First verify current password
    $sql = "SELECT Password FROM user WHERE userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['USER_ID']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    $user = $result->fetch_assoc();
    if (!password_verify($data['currentPassword'], $user['Password'])) {
        echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect']);
        exit;
    }

    // Update to new password
    $hashedNewPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    $sql = "UPDATE user SET Password = ? WHERE userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $hashedNewPassword, $_SESSION['USER_ID']);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Password updated successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update password']);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error updating password: ' . $e->getMessage()]);
}

$conn->close();
?>