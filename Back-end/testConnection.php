<?php
include 'connexion.php';

// Test the connection
if ($conn) {
    echo "Database connection successful!";
} else {
    echo "Database connection failed: " . mysqli_connect_error();
}