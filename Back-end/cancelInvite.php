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

session_start();

if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['inviteID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invite ID is required']);
    exit;
}

try {
    $conn->begin_transaction();

    // Verify this invite belongs to the current user
    $sql = "SELECT ti.inviteID 
            FROM team_invites ti
            JOIN student s ON ti.from_studentID = s.studentID
            WHERE ti.inviteID = ? AND s.userID = ? AND ti.status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $data['inviteID'], $_SESSION['USER_ID']);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows === 0) {
        throw new Exception('Invite not found or not authorized to cancel');
    }

    // Delete the invite
    $sql2 = "DELETE FROM team_invites WHERE inviteID = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $data['inviteID']);
    $stmt2->execute();

    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Invite cancelled successfully'
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>