<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

$role = $_GET['role'] ?? null;

if ($role) {
    $sql = "SELECT * FROM user WHERE Role = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $role);
} else {
    $sql = "SELECT * FROM user";
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();
$users = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($users);

$stmt->close();
$conn->close();
?>
