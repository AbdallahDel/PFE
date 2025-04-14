<?php
include 'connexion.php'; // or require 'connection.php';


header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Enable error reporting but log to file instead of output
error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off HTML error display
ini_set('log_errors', 1);

//get POST data
$userName = $_POST["userName"] ?? '';
$Password = $_POST["Password"] ?? '';
$hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
$Email = $_POST["Email"] ?? '';
$PhoneNumber = $_POST["PhoneNumber"] ?? '';
$Role = $_POST["Role"] ?? '';




//validate input
if (empty($userName)|| empty ($Password)|| empty ($Email)||empty ($PhoneNumber)){
    echo json_encode(['message'=>'all fields are required']);
    exit;
}
try {

//prepare and execute the statement
$stmt = $conn->prepare ("INSERT INTO user (userName,Password,Email,PhoneNumber,Role)VALUES (?,?,?,?,?)");
$stmt ->bind_param("sssss",$userName,$hashedPassword,$Email,$PhoneNumber,$Role);
if ($stmt->execute()){
    echo json_encode(['message'=>'user saved with success']);
}
else {
    echo json_encode (['message'=>'error saving user']);
}
$stmt->close();
$conn->close();
}
catch (Exception $e){
    echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
}


?>