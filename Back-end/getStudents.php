<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$sql = "SELECT s.*, t.teamName 
        FROM student s 
        LEFT JOIN team t ON s.teamID = t.teamID";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode($students);

$stmt->close();
$conn->close();
?>