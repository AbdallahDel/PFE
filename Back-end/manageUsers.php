<?php
include 'connexion.php'; // or require 'connection.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();  // Move this to the top


// cherchee the username 
$sql = "SELECT * FROM user" ;
$stmt = $conn ->prepare ($sql);
$stmt ->execute();
$result = $stmt->get_result();

$users = [];
$users = $result->fetch_all(MYSQLI_ASSOC);  // Correct constant: MYSQLI_ASSOC


echo json_encode($users);

$stmt->close();
$conn->close();
?>