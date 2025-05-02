<?php
// Suppress all PHP errors from being 

ini_set('display_errors', 0);
error_reporting(0);

// Include database connection
include 'connexion.php';

// Set headers first, before any potential output
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

// Start session handling
@session_start();

$data = json_decode(file_get_contents("php://input"), true);
file_put_contents('debug.log', print_r($data, true));

// Validate user ID
if (!isset($data['userID']) || !is_numeric($data['userID'])) {
    echo json_encode(["status" => "error", "message" => "Invalid user ID"]);
    exit;
}

// Get the user type directly from the submitted data
$userType = isset($data['Role']) ? $data['Role'] : null;

// If role wasn't provided, exit with error
if (!$userType) {
    echo json_encode(["status" => "error", "message" => "Role not specified"]);
    exit;
}

try {
    // Always update the user table first for Email and other common fields
    $updateUserFields = [];
    $userParams = [];
    $userTypes = "";
    
    if (isset($data['userName'])) {
        $updateUserFields[] = "userName = ?";
        $userParams[] = $data['userName'];
        $userTypes .= "s";
    }
    
    if (isset($data['Email'])) {
        $updateUserFields[] = "userName = ?";
        $userParams[] = $data['Email'];
        $userTypes .= "s";
    }
    
    if (isset($data['PhoneNumber'])) {
        $updateUserFields[] = "PhoneNumber = ?";
        $userParams[] = $data['PhoneNumber'];
        $userTypes .= "s";
    }
    
    // Always update Role with what was provided
    $updateUserFields[] = "Role = ?";
    $userParams[] = $userType;
    $userTypes .= "s";
    
    // Add userID to params
    $userParams[] = $data['userID'];
    $userTypes .= "i";
    
    if (!empty($updateUserFields)) {
        $userSql = "UPDATE user SET " . implode(", ", $updateUserFields) . " WHERE userID = ?";
        $userStmt = $conn->prepare($userSql);
        
        if ($userStmt) {
            $userStmt->bind_param($userTypes, ...$userParams);
            
            if (!$userStmt->execute()) {
                echo json_encode(['status' => 'error', 'message' => 'Error updating user table']);
                $userStmt->close();
                $conn->close();
                exit;
            }
            $userStmt->close();
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare user update statement']);
            $conn->close();
            exit;
        }
    }
    
    // Now update the role-specific table
    if ($userType === 'supervisor') {
        // Update supervisor info WITHOUT the Email field
        $supervisorSQL = "UPDATE supervisors SET
            nom = ?,
            prenom = ?,
            Grade = ?
            WHERE userID = ?";
        
        $supervisorStmt = $conn->prepare($supervisorSQL);
        if ($supervisorStmt) {
            $supervisorStmt->bind_param("sssi",
                $data['nom'],
                $data['prenom'],
                $data['Grade'],
                $data['userID']
            );
            
            if ($supervisorStmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Supervisor updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Error updating supervisor data: ' . $supervisorStmt->error]);
            }
            $supervisorStmt->close();
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare supervisor statement']);
        }
    } else if ($userType === 'student') {
        // First check if binome exists
        if (isset($data['binome_id'])) {
            $checkBinomeSQL = "SELECT * FROM binomes WHERE binome_id = ?";
            $checkStmt = $conn->prepare($checkBinomeSQL);
            $checkStmt->bind_param("i", $data['binome_id']);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            
            // If binome doesn't exist, create it
            if ($result->num_rows == 0) {
                $createBinomeSQL = "INSERT INTO binomes (binome_id) VALUES (?)";
                $createStmt = $conn->prepare($createBinomeSQL);
                $createStmt->bind_param("i", $data['binome_id']);
                $createStmt->execute();
                $createStmt->close();
            }
            $checkStmt->close();
        }
        
        // Update students info
        $studentsql = "UPDATE students SET
            nom = ?,
            prenom = ?,
            matricule = ?,
            level = ?,
            binome_id = ?
            WHERE userID = ?";
        
        $stmtStudent = $conn->prepare($studentsql);
        if ($stmtStudent) {
            $stmtStudent->bind_param("ssisii",
                $data['nom'],
                $data['prenom'],
                $data['matricule'],
                $data['niveau'],
                $data['binome_id'],
                $data['userID']
            );
            
            if ($stmtStudent->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Student updated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Error updating student data: ' . $stmtStudent->error]);
            }
            $stmtStudent->close();
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare student statement']);
        }
    } else {
        echo json_encode(['status' => 'success', 'message' => $userType . ' data updated successfully']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    $conn->close();
    exit;
}

$conn->close();
?>