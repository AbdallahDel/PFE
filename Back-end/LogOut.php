<?php
header("Content-Type: application/json");
session_start();

//destroy the session
session_unset();
session_destroy();

echo json_encode(['status'=>'success','message'=>'user Logged out']);



?>