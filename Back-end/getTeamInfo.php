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
    // First get the student's info and team
    $sql = "SELECT t.teamID, t.teamName, s.first_name, s.last_name, s.matricule, s.email, s.studentID
            FROM student s 
            LEFT JOIN team t ON s.teamID = t.teamID 
            WHERE s.userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['USER_ID']);
    $stmt->execute();
    $result = $stmt->get_result();
    $studentData = $result->fetch_assoc();

    if (!$studentData['teamID']) {
        echo json_encode([
            'status' => 'success',
            'teamName' => null,
            'members' => [],
            'outgoingInvites' => []
        ]);
        exit;
    }

    // Get other team members
    $sql2 = "SELECT s.first_name, s.last_name, s.matricule, s.email 
             FROM student s 
             WHERE s.teamID = ? AND s.userID != ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("ii", $studentData['teamID'], $_SESSION['USER_ID']);
    $stmt2->execute();
    $membersResult = $stmt2->get_result();
    
    // Start with current student as first member
    $members = array(array(
        'first_name' => $studentData['first_name'],
        'last_name' => $studentData['last_name'],
        'matricule' => $studentData['matricule'],
        'email' => $studentData['email']
    ));
    
    // Add other team members
    while ($member = $membersResult->fetch_assoc()) {
        $members[] = $member;
    }

    // Get outgoing invites
    $sql3 = "SELECT ti.inviteID, s.first_name, s.last_name, s.matricule, s.email,
             ti.created_at, ti.status
             FROM team_invites ti
             JOIN student s ON ti.to_studentID = s.studentID
             WHERE ti.from_studentID = ? AND ti.status = 'pending'";
    $stmt3 = $conn->prepare($sql3);
    $stmt3->bind_param("i", $studentData['studentID']);
    $stmt3->execute();
    $invitesResult = $stmt3->get_result();
    
    $outgoingInvites = [];
    while ($invite = $invitesResult->fetch_assoc()) {
        $outgoingInvites[] = $invite;
    }

    echo json_encode([
        'status' => 'success',
        'teamName' => $studentData['teamName'],
        'members' => $members,
        'outgoingInvites' => $outgoingInvites,
        'hasPendingOutgoingInvite' => count($outgoingInvites) > 0
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>