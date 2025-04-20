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

try {
    $conn->begin_transaction();

    // Get all team members including the current student
    $sql = "SELECT s.studentID, s.first_name, s.teamID, t.teamName
            FROM student s 
            JOIN team t ON s.teamID = t.teamID
            WHERE s.userID = ? OR s.teamID = (
                SELECT teamID FROM student WHERE userID = ?
            )";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $_SESSION['USER_ID'], $_SESSION['USER_ID']);
    $stmt->execute();
    $result = $stmt->get_result();
    $teamMembers = $result->fetch_all(MYSQLI_ASSOC);

    if (count($teamMembers) <= 1) {
        throw new Exception('Cannot leave team - team has only one member');
    }

    $oldTeamId = $teamMembers[0]['teamID'];

    // Create new teams for each member and reassign them
    foreach ($teamMembers as $member) {
        // Create a simple team name using first name
        $newTeamName = $member['first_name'] . "_team";

        // Create the new team
        $sql3 = "INSERT INTO team (teamName) VALUES (?)";
        $stmt3 = $conn->prepare($sql3);
        $stmt3->bind_param("s", $newTeamName);
        $stmt3->execute();
        
        $newTeamId = $conn->insert_id;

        // Update the student's team
        $sql4 = "UPDATE student SET teamID = ? WHERE studentID = ?";
        $stmt4 = $conn->prepare($sql4);
        $stmt4->bind_param("ii", $newTeamId, $member['studentID']);
        $stmt4->execute();
    }

    // Delete the old team
    $sql5 = "DELETE FROM team WHERE teamID = ?";
    $stmt5 = $conn->prepare($sql5);
    $stmt5->bind_param("i", $oldTeamId);
    $stmt5->execute();

    // Delete any pending invites for the old team
    $sql6 = "DELETE FROM team_invites WHERE teamID = ?";
    $stmt6 = $conn->prepare($sql6);
    $stmt6->bind_param("i", $oldTeamId);
    $stmt6->execute();

    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Team disbanded and members reset to individual teams successfully'
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>