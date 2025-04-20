<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if (!isset($_GET['query'])) {
    echo json_encode(['status' => 'error', 'message' => 'Search query is required']);
    exit;
}

try {
    // Get current student's ID to exclude from results
    $sql1 = "SELECT studentID FROM student WHERE userID = ?";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("i", $_SESSION['USER_ID']);
    $stmt1->execute();
    $currentStudent = $stmt1->get_result()->fetch_assoc();

    $query = '%' . $_GET['query'] . '%';
    
    // Search for students by matricule or name, excluding current student
    $sql = "SELECT s.matricule, s.first_name, s.last_name, 
            (SELECT COUNT(*) FROM student s2 WHERE s2.teamID = s.teamID) as teamSize
            FROM student s
            WHERE (s.matricule LIKE ? OR 
                  s.first_name LIKE ? OR 
                  s.last_name LIKE ?) 
            AND s.studentID != ?
            LIMIT 5";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $query, $query, $query, $currentStudent['studentID']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = [
            'matricule' => $row['matricule'],
            'name' => $row['first_name'] . ' ' . $row['last_name'],
            'available' => $row['teamSize'] <= 1
        ];
    }

    echo json_encode([
        'status' => 'success',
        'students' => $students
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>