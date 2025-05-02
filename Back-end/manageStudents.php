<?php


header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
include 'connexion.php';

session_start();

$sql = "
    SELECT 
        students.userID,
        students.nom,
        students.prenom,
        user.email,
        students.matricule,
        students.level AS niveau,
        students.binome_id
    FROM students
    INNER JOIN user ON students.userID = user.userID
    WHERE user.Role = 'student'
";


$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();
$students = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($students);

$stmt->close();
$conn->close();
?>
