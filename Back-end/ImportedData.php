<?php
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'php_error.log');

// Get JSON input
$jsonData = file_get_contents('php://input');
$users = json_decode($jsonData, true);

// Debug received data
file_put_contents('import_debug.log', print_r($users, true));

if (!is_array($users)) {
    echo json_encode(['message' => 'Invalid data format. Expected array of users.']);
    exit;
}

$successCount = 0;
$errorCount = 0;
$errors = [];
$processedBinomes = []; // Track binomes we've already processed

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // Prepare statements for all tables
    $userStmt = $conn->prepare("INSERT INTO user (userName, Password, Role) VALUES (?, ?, ?)");
    $binomeCheckStmt = $conn->prepare("SELECT binome_id FROM binomes WHERE binome_id = ?");
    $binomeInsertStmt = $conn->prepare("INSERT INTO binomes (binome_id) VALUES (?)");
    $studentStmt = $conn->prepare("INSERT INTO students (userID, nom, prenom, matricule, level, binome_id) VALUES (?, ?, ?, ?, ?, ?)");
    $supervsiorStmt = $conn->prepare("INSERT INTO supervisors (userID, nom, prenom, Grade) VALUES ( ?, ?, ?, ?)");
    
    // First step: Process all binome_ids (only for student role)
    foreach ($users as $user) {
        // Check if this is a student record with a binome_id
        if (isset($user["Role"]) && $user["Role"] === "student" && isset($user["binome_id"])) {
            $binome_id = $user["binome_id"];
            
            // Skip if we've already processed this binome
            if (in_array($binome_id, $processedBinomes)) {
                continue;
            }
            
            // Check if binome_id already exists
            $binomeCheckStmt->bind_param("i", $binome_id);
            $binomeCheckStmt->execute();
            $binomeCheckStmt->store_result();
            
            // If binome doesn't exist, insert it
            if ($binomeCheckStmt->num_rows == 0) {
                $binomeInsertStmt->bind_param("i", $binome_id);
                if (!$binomeInsertStmt->execute()) {
                    $errorCount++;
                    $errors[] = "Binome insertion failed for binome_id $binome_id: " . $conn->error;
                } else {
                    $processedBinomes[] = $binome_id; // Track this as processed
                }
            } else {
                $processedBinomes[] = $binome_id; // Track existing binome as processed
            }
        }
    }

    // Process all users based on their Role
    foreach ($users as $user) {
        // Check if Role exists
        if (!isset($user["Role"])) {
            $errorCount++;
            $errors[] = "Role not specified for a user, skipping";
            continue;
        }
        
        // Handle each role type differently
        if ($user["Role"] === "student") {
            // Student specific fields
            $matricule = $user["matricule"] ?? '';
            $nom = $user["nom"] ?? '';
            $prenom = $user["prenom"] ?? '';
            $niveau = $user["level"] ?? '';
            $password = $user["Password"] ?? '';
            $binome_id = $user["binome_id"] ?? NULL;
            $role = 'student';
            
            // Validate input
            if (empty($matricule) || empty($nom) || empty($prenom) || empty($password)) {
                $errorCount++;
                $errors[] = "Missing required fields for student, skipping";
                continue;
            }
            
            // Hash the password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert into user table using matricule as userName
            $userStmt->bind_param("sss", $matricule, $hashedPassword, $role);
            
            if ($userStmt->execute()) {
                // Get new user ID
                $userID = $conn->insert_id;
                
                // Insert into students table
                $studentStmt->bind_param("issssi", $userID, $nom, $prenom, $matricule, $niveau, $binome_id);
                
                if ($studentStmt->execute()) {
                    $successCount++;
                } else {
                    $errorCount++;
                    $errors[] = "Student insertion failed: " . $conn->error;
                }
            } else {
                $errorCount++;
                $errors[] = "User insertion failed: " . $conn->error;
            }
        } 
        else if ($user["Role"] === "supervisor") {
            // Supervisor specific fields
            $nom = $user["nom"] ?? '';
            $prenom = $user["prenom"] ?? '';
            $Email = $user["Email"] ?? '';
            $Grade = $user["Grade"] ?? '';
            $password = $user["Password"] ?? '';
            $role = 'supervisor';
            
            // Validate input
            if (empty($Email) || empty($nom) || empty($prenom) || empty($password)) {
                $errorCount++;
                $errors[] = "Missing required fields for supervisor, skipping";
                continue;
            }
            
            // Hash the password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert into user table
            // Note: Corrected from 4 parameters to 3 parameters
            $userStmt->bind_param("sss", $Email, $hashedPassword, $role);
            
            if ($userStmt->execute()) {
                // Get new user ID
                $userID = $conn->insert_id;
                
                // Insert into supervisors table
                $supervsiorStmt->bind_param("isss", $userID, $nom, $prenom, $Grade);
                
                if ($supervsiorStmt->execute()) {
                    $successCount++;
                } else {
                    $errorCount++;
                    $errors[] = "Supervisor insertion failed: " . $conn->error;
                }
            } else {
                $errorCount++;
                $errors[] = "User insertion failed: " . $conn->error;
            }
        }
        else {
            // Unknown role
            $errorCount++;
            $errors[] = "Unknown role: " . $user["Role"] . ", skipping";
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    // Close statements
    $userStmt->close();
    $binomeCheckStmt->close();
    $binomeInsertStmt->close();
    $studentStmt->close();
    $supervsiorStmt->close();
    $conn->close();
    
    if ($successCount > 0) {
        echo json_encode([
            'message' => 'imported user/s saved with success',
            'success' => $successCount,
            'errors' => $errorCount,
            'errorDetails' => $errors
        ]);
    } else {
        echo json_encode([
            'message' => 'error saving imported user/s',
            'errorDetails' => $errors
        ]);
    }
} catch (Exception $e) {
    // Roll back on error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    
    echo json_encode([
        'message' => 'Error: ' . $e->getMessage(),
        'errorDetails' => $errors
    ]);
}
?>