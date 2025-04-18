<?php
// Connection details exactly as shown in your control panel
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "testform";

// Try to establish connection with timeout
$conn = mysqli_init();
if (!$conn) {
    die("mysqli_init failed");
}

// Set connection timeout 
mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 5);

// Attempt connection
if (!mysqli_real_connect($conn, $servername, $username, $password, $dbname)) {
    die("Connect Error: " . mysqli_connect_error());
}

// If we get here, connection was successful

?>