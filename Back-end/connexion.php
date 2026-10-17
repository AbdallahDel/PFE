<?php
$servername = getenv('MYSQLHOST') ?: (getenv('DOCKER_ENV') ? 'db' : 'localhost');
$username   = getenv('MYSQLUSER') ?: 'root';
$password   = getenv('MYSQLPASSWORD') ?: '';
$dbname     = getenv('MYSQLDATABASE') ?: 'testform';
$port       = (int)(getenv('MYSQLPORT') ?: 3306);

mysqli_report(MYSQLI_REPORT_OFF);
$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "DB error: " . $conn->connect_error]));
}

$conn->set_charset("utf8");
?>
