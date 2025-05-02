<?php
include 'connexion.php'; // or require 'connection.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');



session_start();  // Move this to the top





// cherchee the username 
$sql = "SELECT * FROM user WHERE userID = ?";
$stmt = $conn ->prepare ($sql);
$stmt ->bind_param("s",$_SESSION['USER_ID']);
$stmt ->execute();
$result = $stmt->get_result();


if ($result->num_rows >0){
    $user = $result->fetch_assoc();
    if ($user['Role']==='admin'){
        echo json_encode(['role'=>'admin',
                            'status'=>'success',
                            'message'=>'admin logged in']);}
    if($user['Role']==='student'){
                        echo json_encode(['role'=>'student',
                        'status'=>'success',
                        'message'=>'student logged in']);
                    }
    if($user['Role']==='supervisor'){
                        echo json_encode(['role'=>'supervisor',
                        'status'=>'success',
                        'message'=>'supervisor logged in']);
                    }}
else{
    echo json_encode(['status'=>'error',
                        'message'=>'please login first ']);
}
$stmt->close();
$conn->close();




?>