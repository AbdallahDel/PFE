<?php
include 'connexion.php'; // or require 'connection.php';


$jsonData = json_decode(file_get_contents('php://input'), true);
$userName = $jsonData["userName"] ?? '';
$Password = $jsonData["Password"] ?? '';
$Role = $jsonData["Role"] ?? '';



header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK status
    exit(0);
}
// Enable error reporting but log to file instead of output
error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off HTML error display
ini_set('log_errors', 1);

//get POST data
$userName = $_POST["userName"] ?? '';
$Password = $_POST["Password"] ?? '';
$hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
$Role = $_POST["Role"] ?? '';

//validate input
if (empty($userName)|| empty ($Password)){
    echo json_encode(['message'=>'all fields are required']);
    exit;
}
try {

//prepare and execute the statement
$stmt = $conn->prepare ("INSERT INTO user (userName,Password,Role)VALUES (?,?,?)");
$stmt ->bind_param("sss",$userName,$hashedPassword,$Role);
if ($stmt->execute()){
    $newUserId = $conn->insert_id;  // Get the ID of the newly inserted row
    echo json_encode([
        'message' => 'user added with success',
        'userID' => $newUserId,     // Include this ID
        'userName' => $userName,
        'Role' => $Role
    ]);
}else {
    echo json_encode (['message'=>'error adding user']);
}
$stmt->close();
$conn->close();
}
catch (Exception $e){
    echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
}


?>