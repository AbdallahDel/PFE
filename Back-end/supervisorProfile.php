<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

// Check if userID exists in session
if (isset($_SESSION['userID'])) {
    $user_id = $_SESSION['userID'];
} elseif (isset($_SESSION['USER_ID'])) {
    $user_id = $_SESSION['USER_ID'];
} else {
    // For debugging - remove in production
    $user_id = 1; // Default for testing
}

// Query to get supervisor information
$sql = "SELECT supervisor_id, userID, nom, prenom, Grade as grade FROM supervisors WHERE userID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $supervisor = $result->fetch_assoc();
    echo json_encode([
        'status' => 'success',
        'supervisor' => $supervisor
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Supervisor not found'
    ]);
}

$stmt->close();
$conn->close();
?>