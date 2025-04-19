<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$sql = "SELECT p.*, 
        CONCAT(s.first_name, ' ', s.last_name) as supervisorName,
        t.teamName 
        FROM project p
        LEFT JOIN supervisor s ON p.supervisorID = s.supervisorID
        LEFT JOIN team t ON p.projectID = t.projectID";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$projects = [];
while ($row = $result->fetch_assoc()) {
    $projects[] = $row;
}

echo json_encode($projects);

$stmt->close();
$conn->close();
?>