<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get and decode the JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['userName']) || !isset($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

try {
    // Create the admin user account
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $sql = "INSERT INTO user (userName, Password, Role) VALUES (?, ?, 'admin')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", 
        $data['userName'],
        $hashedPassword
    );
    
    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        echo json_encode([
            'status' => 'success',
            'message' => 'Admin user added successfully',
            'userId' => $userId,
            'userName' => $data['userName']
        ]);
    } else {
        throw new Exception($stmt->error);
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error adding admin: ' . $e->getMessage()
    ]);
}

$conn->close();
?>