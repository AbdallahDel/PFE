<?php
// Database connection for Docker environment
$servername = "db";  // Use Docker service name
$username = "root";
$password = "";      // Empty password
$dbname = "testform";

// Wait for database to be ready
$max_retries = 30;
$retry_count = 0;

while ($retry_count < $max_retries) {
    try {
        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        
        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Set charset
        $conn->set_charset("utf8");
        
        // If we get here, connection is successful
        break;
        
    } catch (Exception $e) {
        $retry_count++;
        if ($retry_count >= $max_retries) {
            die("Database connection failed after $max_retries attempts: " . $e->getMessage());
        }
        // Wait 1 second before retrying
        sleep(1);
    }
}
?>