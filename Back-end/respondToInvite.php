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

if (!isset($data['inviteID']) || !isset($data['response']) || !in_array($data['response'], ['accept', 'decline'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request parameters']);
    exit;
}

try {
    $conn->begin_transaction();

    // Get the invite details and validate it's for this student
    $sql = "SELECT ti.*, s.teamID as current_team_id
            FROM team_invites ti
            JOIN student s ON s.userID = ?
            WHERE ti.inviteID = ? AND ti.to_studentID = s.studentID AND ti.status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $_SESSION['USER_ID'], $data['inviteID']);
    $stmt->execute();
    $result = $stmt->get_result();
    $invite = $result->fetch_assoc();

    if (!$invite) {
        throw new Exception('Invalid invite');
    }

    if ($data['response'] === 'accept') {
        // Check if the inviting team still has space
        $sql2 = "SELECT COUNT(*) as memberCount FROM student WHERE teamID = ?";
        $stmt2 = $conn->prepare($sql2);
        $stmt2->bind_param("i", $invite['teamID']);
        $stmt2->execute();
        $teamCount = $stmt2->get_result()->fetch_assoc();

        if ($teamCount['memberCount'] >= 2) {
            throw new Exception('Team is already full');
        }

        // Get the student's current team
        $oldTeamId = $invite['current_team_id'];
        
        // Update the student's team
        $sql3 = "UPDATE student SET teamID = ? WHERE userID = ?";
        $stmt3 = $conn->prepare($sql3);
        $stmt3->bind_param("ii", $invite['teamID'], $_SESSION['USER_ID']);
        $stmt3->execute();

        // Delete the old team if it's empty
        if ($oldTeamId) {
            $sql4 = "DELETE FROM team WHERE teamID = ? AND NOT EXISTS (
                        SELECT 1 FROM student WHERE teamID = ?
                    )";
            $stmt4 = $conn->prepare($sql4);
            $stmt4->bind_param("ii", $oldTeamId, $oldTeamId);
            $stmt4->execute();
        }
    }

    // Update invite status
    $status = $data['response'] === 'accept' ? 'accepted' : 'declined';
    $sql5 = "UPDATE team_invites SET status = ? WHERE inviteID = ?";
    $stmt5 = $conn->prepare($sql5);
    $stmt5->bind_param("si", $status, $data['inviteID']);
    $stmt5->execute();

    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Invite ' . $status . ' successfully'
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>