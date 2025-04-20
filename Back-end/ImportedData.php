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
$data = json_decode($jsonData, true);

if (!isset($data['type']) || !isset($data['users']) || !is_array($data['users'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data format. Expected type and array of users.']);
    exit;
}

$type = $data['type'];
$users = $data['users'];
$successCount = 0;
$errorCount = 0;

try {
    $conn->begin_transaction();

    if ($type === 'supervisor') {
        // First create the user account
        $stmt1 = $conn->prepare("INSERT INTO user (userName, Password, Role) VALUES (?, ?, 'supervisor')");
        $stmt2 = $conn->prepare("INSERT INTO supervisor (userID, first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?, ?)");

        foreach ($users as $user) {
            $username = $user['userName'] ?? '';
            $password = $user['password'] ?? $username; // Default password to username if not provided
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Insert into user table
            $stmt1->bind_param("ss", $username, $hashedPassword);
            if ($stmt1->execute()) {
                $userId = $conn->insert_id;
                
                // Insert into supervisor table
                $stmt2->bind_param("issss", 
                    $userId,
                    $user['first_name'] ?? '',
                    $user['last_name'] ?? '',
                    $user['email'] ?? '',
                    $user['phone_number'] ?? ''
                );
                
                if ($stmt2->execute()) {
                    $successCount++;
                } else {
                    $errorCount++;
                }
            } else {
                $errorCount++;
            }
        }
        
        $stmt1->close();
        $stmt2->close();
    }
    
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Import completed successfully',
        'success_count' => $successCount,
        'error_count' => $errorCount
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'status' => 'error',
        'message' => 'Error during import: ' . $e->getMessage()
    ]);
}

$conn->close();
?>