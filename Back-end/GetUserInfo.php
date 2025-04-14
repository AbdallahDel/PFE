<?php
include 'connexion.php'; // or require 'connection.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();  // Move this to the top


// cherchee the username 
$sql = "SELECT * FROM user WHERE userID = ?";
$stmt = $conn ->prepare ($sql);
$stmt ->bind_param("s",$_SESSION['USER_ID']);
$stmt ->execute();
$result = $stmt->get_result();


if ($result->num_rows >0){
    $user = $result->fetch_assoc();
    echo json_encode (['status'=>'success',
                        'username'=>$user['userName'],
                        'email'=>$user['Email'],
                        'message'=>'Got user info successfully',
    
]);
    
}
else {
    echo json_encode (["success"=>'error', "message"=>"error getting user info"]);
}

$stmt->close();
$conn->close();
?>