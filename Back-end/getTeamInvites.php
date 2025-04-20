<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

try {
    // First get the student's ID
    $sql = "SELECT studentID FROM student WHERE userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['USER_ID']);
    $stmt->execute();
    $result = $stmt->get_result();
    $student = $result->fetch_assoc();

    if (!$student) {
        throw new Exception('Student not found');
    }

    // Get pending invites for this student
    $sql2 = "SELECT ti.inviteID, ti.teamID, t.teamName, 
             s.first_name, s.last_name, s.matricule
             FROM team_invites ti
             JOIN team t ON ti.teamID = t.teamID
             JOIN student s ON ti.from_studentID = s.studentID
             WHERE ti.to_studentID = ? AND ti.status = 'pending'";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $student['studentID']);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    
    $invites = [];
    while ($invite = $result2->fetch_assoc()) {
        $invites[] = $invite;
    }

    echo json_encode([
        'status' => 'success',
        'invites' => $invites
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>