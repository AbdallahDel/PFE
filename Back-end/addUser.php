<?php
include 'connexion.php'; // or require 'connection.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK status
    exit(0);
}

// Enable error reporting but log to file instead of output
error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off HTML error display
ini_set('log_errors', 1);

// Determine if this is a student request by checking for student-specific fields
$isStudentRequest = isset($_POST["matricule"]) && isset($_POST["prenom"]) && isset($_POST["niveau"]);
$isSupervisorRequest = isset($_POST["Email"]) && isset($_POST["prenom"]) && isset($_POST["Grade"]);

try {
    $conn->begin_transaction();

    
    if ($isStudentRequest) {
        // This is a student addition request
        
        // Get student-specific fields
        $matricule = $_POST["matricule"] ?? '';
        $prenom = $_POST["prenom"] ?? '';
        $nom = $_POST["nom"] ?? '';
        $niveau = $_POST["niveau"] ?? 'licence';
        $equipeID = $_POST["equipeID"] ?? NULL;
        $Password = $_POST["Password"] ?? '';
        $Role = $_POST["Role"] ?? 'student';
        
        // Validate student-specific fields
        if (empty($matricule) || empty($prenom) || empty($niveau) || empty($Password)) {
            echo json_encode(['message' => 'All student fields are required']);
            exit;
        }
        
        $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
        
        // First create the user entry - using matricule as the username for students
        $stmt = $conn->prepare("INSERT INTO user (userName, Password, Role) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $matricule, $hashedPassword, $Role);
        
        if ($stmt->execute()) {
            $newUserId = $conn->insert_id;
            
            // Then create the student entry with the userID foreign key
            $studentStmt = $conn->prepare("INSERT INTO students (userID, matricule, prenom,nom, level, binome_id) VALUES (?,?, ?, ?, ?, ?)");
            $studentStmt->bind_param("issssi", $newUserId, $matricule, $prenom,$nom, $niveau, $equipeID);
            
            if ($studentStmt->execute()) {
                $conn->commit();
                echo json_encode([
                    'message' => 'user added with success',
                    'userID' => $newUserId,
                    'matricule' => $matricule,
                    'prenom' => $prenom,
                    'nom'=>$nom,
                    'niveau' => $niveau,
                    'equipeID' => $equipeID,
                    'Role' => $Role
                ]);
            } else {
                $conn->rollback();
                echo json_encode(['message' => 'Error adding student details: ' . $conn->error]);
            }
            $studentStmt->close();
        } else {
            $conn->rollback();
            echo json_encode(['message' => 'Error adding user: ' . $conn->error]);
        }
        $stmt->close();


    // This is a supervisor addition request
        //
    } if($isSupervisorRequest){
        
        // Get supervisor-specific fields
        $Email = $_POST["Email"] ?? '';
        $prenom = $_POST["prenom"] ?? '';
        $nom = $_POST["nom"] ?? '';
        $Grade = $_POST["Grade"] ?? '';
        $Password = $_POST["Password"] ?? '';
        $Role = $_POST["Role"] ?? 'supervisor';
        
        // Validate supervsior-specific fields
        if (empty($Email) || empty($prenom) || empty($Grade) || empty($Password)) {
            echo json_encode(['message' => 'All supervsior fields are required']);
            exit;
        }
        
        $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
        
        // First create the user entry - using matricule as the username for supervisors
        $stmt = $conn->prepare("INSERT INTO user (userName, Password, Role) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $Email, $hashedPassword, $Role);
        
        if ($stmt->execute()) {
            $newUserId = $conn->insert_id;
            
            // Then create the supervsior entry with the userID foreign key
            $supervsiorStmt = $conn->prepare("INSERT INTO supervisors (userID, prenom,nom, Grade) VALUES (?,?, ?, ?)");
            $supervsiorStmt->bind_param("isss", $newUserId, $prenom,$nom, $Grade);
            
            if ($supervsiorStmt->execute()) {
                $conn->commit();
                echo json_encode([
                    'message' => 'user added with success',
                    'userID' => $newUserId,
                    'prenom' => $prenom,
                    'nom'=>$nom,
                    'Grade' => $Grade,
                    'Role' => $Role,
                    'Email' => $Email
                ]);
            } else {
                $conn->rollback();
                echo json_encode(['message' => 'Error adding supervsior details: ' . $conn->error]);
            }
            $supervsiorStmt->close();
        } else {
            $conn->rollback();
            echo json_encode(['message' => 'Error adding user: ' . $conn->error]);
        }
        $stmt->close();


    } else {
        // This is a regular user addition request
        $userName = $_POST["userName"] ?? '';
        $Password = $_POST["Password"] ?? '';
        $Role = $_POST["Role"] ?? '';
        
        
        
        $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
        
        // Just insert into the user table
        $stmt = $conn->prepare("INSERT INTO user (userName, Password, Role) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $userName, $hashedPassword, $Role);
        
        if ($stmt->execute()) {
            $newUserId = $conn->insert_id;
            $conn->commit();
            echo json_encode([
                'message' => 'user added with success',
                'userID' => $newUserId,
                'userName' => $userName,
                'Role' => $Role
            ]);
        } else {
            $conn->rollback();
            echo json_encode(['message' => 'Error adding user: ' . $conn->error]);
        }
        $stmt->close();
    }
    
    $conn->close();
} catch (Exception $e) {
    // Make sure to rollback if we catch any exceptions
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
        $conn->close();
    }
    echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
    
    // Log error for debugging
    error_log("Error in addUser.php: " . $e->getMessage());
}
?>