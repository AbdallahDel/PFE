<?php


header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
include 'connexion.php';

session_start();

$sql = "
    SELECT 
        supervisors.userID,
        supervisors.nom,
        supervisors.prenom,
        user.userName AS Email,
        supervisors.Grade
    FROM supervisors
    INNER JOIN user ON supervisors.userID = user.userID
    WHERE user.Role = 'supervisor'
";


$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();
$supervisor = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($supervisor);

$stmt->close();
$conn->close();
?>
