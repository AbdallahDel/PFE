<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['matricule'])) {
    echo json_encode(['status' => 'error', 'message' => 'Matricule is required']);
    exit;
}

try {
    $conn->begin_transaction();

    // Get the inviting student's info
    $sql = "SELECT s.studentID, s.teamID, s.matricule,
            (SELECT COUNT(*) FROM student s2 WHERE s2.teamID = s.teamID) as memberCount 
            FROM student s 
            WHERE s.userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['USER_ID']);
    $stmt->execute();
    $result = $stmt->get_result();
    $fromStudent = $result->fetch_assoc();

    if (!$fromStudent) {
        throw new Exception('You are not registered as a student');
    }

    // Prevent self-invites
    if ($fromStudent['matricule'] === $data['matricule']) {
        throw new Exception('You cannot invite yourself');
    }

    if (!$fromStudent['teamID']) {
        throw new Exception('You are not in a team');
    }

    if ($fromStudent['memberCount'] >= 2) {
        throw new Exception('Your team is already full');
    }

    // Get the invited student info
    $sql2 = "SELECT studentID, teamID, 
             (SELECT COUNT(*) FROM student s2 WHERE s2.teamID = student.teamID) as memberCount 
             FROM student WHERE matricule = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("s", $data['matricule']);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    $toStudent = $result2->fetch_assoc();

    if (!$toStudent) {
        throw new Exception('Student not found');
    }

    // Check if the invited student is in their default team (team with only them)
    if ($toStudent['memberCount'] > 1) {
        throw new Exception('Student is already in a team with other members');
    }

    // Check if there's already a pending invite
    $sql3 = "SELECT inviteID FROM team_invites 
             WHERE to_studentID = ? AND teamID = ? AND status = 'pending'";
    $stmt3 = $conn->prepare($sql3);
    $stmt3->bind_param("ii", $toStudent['studentID'], $fromStudent['teamID']);
    $stmt3->execute();
    if ($stmt3->get_result()->num_rows > 0) {
        throw new Exception('An invite is already pending for this student');
    }

    // Create the team invite
    $sql4 = "INSERT INTO team_invites (from_studentID, to_studentID, teamID) 
             VALUES (?, ?, ?)";
    $stmt4 = $conn->prepare($sql4);
    $stmt4->bind_param("iii", 
        $fromStudent['studentID'],
        $toStudent['studentID'],
        $fromStudent['teamID']
    );
    
    if (!$stmt4->execute()) {
        throw new Exception('Failed to create team invite: ' . $stmt4->error);
    }

    $inviteId = $conn->insert_id;

    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Team invite sent successfully',
        'debug' => [
            'inviteId' => $inviteId,
            'fromStudent' => $fromStudent['studentID'],
            'toStudent' => $toStudent['studentID'],
            'teamId' => $fromStudent['teamID']
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>