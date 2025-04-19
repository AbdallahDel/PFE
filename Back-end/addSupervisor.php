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
if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

try {
    $conn->begin_transaction();

    // Generate a username from first name and last name
    $username = strtolower($data['first_name'] . '.' . $data['last_name']);
    
    // First create the user account
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $sql1 = "INSERT INTO user (userName, Password, Role) VALUES (?, ?, 'supervisor')";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("ss", $username, $hashedPassword);
    $stmt1->execute();
    
    $userId = $conn->insert_id;

    // Then create the supervisor record
    $sql2 = "INSERT INTO supervisor (userID, first_name, last_name, email, phone_number) 
             VALUES (?, ?, ?, ?, ?)";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("issss", 
        $userId,
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['phone_number']
    );
    $stmt2->execute();
    
    $supervisorId = $conn->insert_id;
    
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Supervisor added successfully',
        'supervisorId' => $supervisorId,
        'username' => $username
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'status' => 'error',
        'message' => 'Error adding supervisor: ' . $e->getMessage()
    ]);
}

$conn->close();
?>