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

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['studentID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Student ID is required']);
    exit;
}

try {
    $conn->begin_transaction();

    // Update student table
    $sql1 = "UPDATE student SET 
             first_name = ?, 
             last_name = ?, 
             email = ?, 
             speciality = ?, 
             education_level = ?,
             phone_number = ?
             WHERE studentID = ?";
             
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("ssssssi",
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['speciality'],
        $data['education_level'],
        $data['phone_number'],
        $data['studentID']
    );
    $stmt1->execute();

    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Student updated successfully']);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Error updating student: ' . $e->getMessage()]);
}

$conn->close();
?>