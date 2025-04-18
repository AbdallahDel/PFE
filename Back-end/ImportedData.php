<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// Enable error reporting but log to file instead of output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Get JSON input instead of POST data
$jsonData = file_get_contents('php://input');
$users = json_decode($jsonData, true);

if (!is_array($users)) {
    echo json_encode(['message' => 'Invalid data format. Expected array of users.']);
    exit;
}

$successCount = 0;
$errorCount = 0;

try {
    // Prepare the statement once outside the loop
    $stmt = $conn->prepare("INSERT INTO user (userName, Password, Email, PhoneNumber, Role) VALUES (?, ?, ?, ?, ?)");
    
    // Loop through each user in the array
    foreach ($users as $user) {
        $userName = $user["userName"] ?? '';
        $Password = $user["Password"] ?? 'defaultPassword'; // You might want a default
        $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
        $Email = $user["Email"] ?? '';
        $PhoneNumber = $user["PhoneNumber"] ?? '';
        $Role = $user["Role"] ?? 'user'; // Default role if not specified
        
        // Validate input for each user
        if (empty($userName)) {
            $errorCount++;
            continue; // Skip this user but process others
        }
        
        // Bind parameters and execute for each user
        $stmt->bind_param("sssss", $userName, $hashedPassword, $Email, $PhoneNumber, $Role);
        
        if ($stmt->execute()) {
            $successCount++;
        } else {
            $errorCount++;
        }
    }
    
    $stmt->close();
    $conn->close();
    
    if ($successCount > 0) {
        echo json_encode([
            'message' => 'imported user/s saved with success',
            'success' => $successCount,
            'errors' => $errorCount
        ]);
    } else {
        echo json_encode(['message' => 'error saving imported user/s']);
    }
} catch (Exception $e) {
    echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
}
?>