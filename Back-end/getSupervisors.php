<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

$sql = "SELECT s.*, 
        (SELECT COUNT(*) FROM project p WHERE p.supervisorID = s.supervisorID) as projects,
        (SELECT COUNT(*) FROM team t WHERE t.supervisorID = s.supervisorID) as teams
        FROM supervisor s";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$supervisors = [];
while ($row = $result->fetch_assoc()) {
    $supervisors[] = $row;
}

echo json_encode($supervisors);

$stmt->close();
$conn->close();
?>