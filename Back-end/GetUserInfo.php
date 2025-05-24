<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

// Check if user is logged in
if (!isset($_SESSION['USER_ID'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in'
    ]);
    exit;
}

$userId = $_SESSION['USER_ID'];

// Get student information by joining students and user tables
$sql = "SELECT s.matricule, s.nom, s.prenom, s.binome_id, s.level, u.Email 
        FROM students s 
        INNER JOIN user u ON s.userID = u.userID 
        WHERE s.userID = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $student = $result->fetch_assoc();
    
    echo json_encode([
        'status' => 'success',
        'student' => $student,
        'message' => 'Student information retrieved successfully'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Student information not found'
    ]);
}

$stmt->close();
$conn->close();
?>