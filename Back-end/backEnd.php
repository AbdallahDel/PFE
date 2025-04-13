<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();  // Move this to the top


//get Post data
$userName = $_POST["userName"]??'';
$Password = $_POST["Password"]??'';
$hashedPassword = password_hash($Password, PASSWORD_DEFAULT);

//validate input
if (empty($userName ||empty($Password) )){
    echo json_encode(['message' => 'all field requered']);
    exit ;
}

//connect to the data base 
$conn= new mysqli('localhost','root','','testform');
if ($conn->connect_error){
    die ('connection failed:'.$conn->connect_error);
};

// cherchee the username 
$sql = "SELECT * FROM USER WHERE userName = ?";
$stmt = $conn ->prepare ($sql);
$stmt ->bind_param("s",$userName);
$stmt ->execute();
$result = $stmt->get_result();


if ($result->num_rows >0){
    $user = $result->fetch_assoc();
    if (password_verify($Password , $user['Password'])){
        $_SESSION['USER_ID']=$user['userID'];
        if ($user['Role']==='admin'){
            echo json_encode (['role'=>'admin',
                        'message'=>'admin access',
                        'success'=>true,
            ]);
        }
        if ($user['Role']==='user') {
            echo json_encode(['role'=>'user',
                        'message'=>'user access',
                        'success'=>true,
                       
        ]);
        }
        if ($user['Role']==='supervisor') {
            echo json_encode(['role'=>'supervisor',
                        'message'=>'supervisor access',
                        'success'=>true,
                       
        ]);
        }

    }
    else {
        echo json_encode (["success"=>false, "message"=>"invalid  password"]);
    }
}
else {
    echo json_encode (["success"=>false, "message"=>"invalid username"]);
}


$stmt->close();
$conn->close();
?>