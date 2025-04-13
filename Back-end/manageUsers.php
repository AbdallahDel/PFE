<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();  // Move this to the top


//connect to the data base 
$conn= new mysqli('localhost','root','','testform');
if ($conn->connect_error){
    die ('connection failed:'.$conn->connect_error);
};

// cherchee the username 
$sql = "SELECT * FROM USER" ;
$stmt = $conn ->prepare ($sql);
$stmt ->execute();
$result = $stmt->get_result();

$users = [];
$users = $result->fetch_all(MYSQLI_ASSOC);  // Correct constant: MYSQLI_ASSOC


echo json_encode($users);

$stmt->close();
$conn->close();
?>