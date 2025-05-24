<?php
include 'connexion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Use $conn (MySQLi) instead of undefined $pdo
    $stmt = $conn->prepare("SELECT COUNT(*) AS total_users FROM user");
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $totalUsers = $row['total_users'] ?? 0;
    
    echo json_encode([
        'success'     => true,
        'total_users' => (int)$totalUsers
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error'   => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
