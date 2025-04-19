<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$sql = "SELECT userID, userName FROM user WHERE Role = 'admin'";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$admins = [];
while ($row = $result->fetch_assoc()) {
    $admins[] = $row;
}

echo json_encode($admins);

$stmt->close();
$conn->close();
?>