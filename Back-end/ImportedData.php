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
file_put_contents('import_debug.log', "Received data: " . print_r($users, true) . "\n", FILE_APPEND);

if (!is_array($users)) {
    echo json_encode(['message' => 'Invalid data format. Expected array of users.', 'status' => 'error']);
    exit;
}

$successCount = 0;
$errorCount = 0;
$errors = [];
$processedBinomes = [];
$duplicateUsers = [];

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // Prepare statements for all tables
    $userStmt = $conn->prepare("INSERT INTO user (userName, Password, Role) VALUES (?, ?, ?)");
    $binomeCheckStmt = $conn->prepare("SELECT binome_id FROM binomes WHERE binome_id = ?");
    $binomeInsertStmt = $conn->prepare("INSERT INTO binomes (binome_id) VALUES (?)");
    $studentStmt = $conn->prepare("INSERT INTO students (userID, nom, prenom, matricule, level, binome_id) VALUES (?, ?, ?, ?, ?, ?)");
    $supervisorStmt = $conn->prepare("INSERT INTO supervisors (userID, nom, prenom, Grade) VALUES (?, ?, ?, ?)");
    
    // Check for duplicate users
    $duplicateCheckStmt = $conn->prepare("SELECT COUNT(*) as count FROM students WHERE matricule = ?");
    $supervisorDuplicateCheckStmt = $conn->prepare("SELECT COUNT(*) as count FROM supervisors WHERE userID IN (SELECT userID FROM user WHERE userName = ?)");
    
    // First step: Process all binome_ids (only for student role)
    foreach ($users as $user) {
        if (isset($user["Role"]) && $user["Role"] === "student" && isset($user["binome_id"]) && !empty($user["binome_id"])) {
            $binome_id = intval($user["binome_id"]);
            
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
                    $processedBinomes[] = $binome_id;
                    file_put_contents('import_debug.log', "Created binome: $binome_id\n", FILE_APPEND);
                }
            } else {
                $processedBinomes[] = $binome_id;
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
            // Student specific fields with better validation
            $matricule = isset($user["matricule"]) ? trim($user["matricule"]) : '';
            $nom = isset($user["nom"]) ? trim($user["nom"]) : '';
            $prenom = isset($user["prenom"]) ? trim($user["prenom"]) : '';
            $level = isset($user["level"]) ? trim($user["level"]) : 'licence'; // Default to licence
            $password = isset($user["Password"]) ? trim($user["Password"]) : '';
            $binome_id = isset($user["binome_id"]) && !empty($user["binome_id"]) ? intval($user["binome_id"]) : NULL;
            $role = 'student';
            
            // Validate required fields
            if (empty($matricule) || empty($nom) || empty($prenom) || empty($password)) {
                $errorCount++;
                $errors[] = "Missing required fields for student (matricule: $matricule), skipping";
                continue;
            }
            
            // Check for duplicate matricule
            $duplicateCheckStmt->bind_param("s", $matricule);
            $duplicateCheckStmt->execute();
            $result = $duplicateCheckStmt->get_result();
            $row = $result->fetch_assoc();
            
            if ($row['count'] > 0) {
                $errorCount++;
                $duplicateUsers[] = $matricule;
                $errors[] = "Student with matricule $matricule already exists, skipping";
                continue;
            }
            
            // Normalize level value
            $level = strtolower($level);
            if (!in_array($level, ['master', 'licence'])) {
                $level = 'licence'; // Default fallback
            }
            
            // Hash the password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert into user table using matricule as userName
            $userStmt->bind_param("sss", $matricule, $hashedPassword, $role);
            
            if ($userStmt->execute()) {
                // Get new user ID
                $userID = $conn->insert_id;
                
                // Insert into students table
                $studentStmt->bind_param("issssi", $userID, $nom, $prenom, $matricule, $level, $binome_id);
                
                if ($studentStmt->execute()) {
                    $successCount++;
                    file_put_contents('import_debug.log', "Successfully added student: $matricule\n", FILE_APPEND);
                } else {
                    $errorCount++;
                    $errors[] = "Student insertion failed for $matricule: " . $conn->error;
                    file_put_contents('import_debug.log', "Student insertion failed for $matricule: " . $conn->error . "\n", FILE_APPEND);
                }
            } else {
                $errorCount++;
                $errors[] = "User insertion failed for $matricule: " . $conn->error;
                file_put_contents('import_debug.log', "User insertion failed for $matricule: " . $conn->error . "\n", FILE_APPEND);
            }
        } 
        else if ($user["Role"] === "supervisor") {
            // Supervisor specific fields
            $nom = isset($user["nom"]) ? trim($user["nom"]) : '';
            $prenom = isset($user["prenom"]) ? trim($user["prenom"]) : '';
            $Email = isset($user["Email"]) ? trim($user["Email"]) : '';
            $Grade = isset($user["Grade"]) ? trim($user["Grade"]) : '';
            $password = isset($user["Password"]) ? trim($user["Password"]) : '';
            $role = 'supervisor';
            
            // Validate required fields
            if (empty($Email) || empty($nom) || empty($prenom) || empty($password)) {
                $errorCount++;
                $errors[] = "Missing required fields for supervisor (email: $Email), skipping";
                continue;
            }
            
            // Validate email format
            if (!filter_var($Email, FILTER_VALIDATE_EMAIL)) {
                $errorCount++;
                $errors[] = "Invalid email format for supervisor: $Email, skipping";
                continue;
            }
            
            // Check for duplicate email
            $supervisorDuplicateCheckStmt->bind_param("s", $Email);
            $supervisorDuplicateCheckStmt->execute();
            $result = $supervisorDuplicateCheckStmt->get_result();
            $row = $result->fetch_assoc();
            
            if ($row['count'] > 0) {
                $errorCount++;
                $duplicateUsers[] = $Email;
                $errors[] = "Supervisor with email $Email already exists, skipping";
                continue;
            }
            
            // Hash the password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert into user table
            $userStmt->bind_param("sss", $Email, $hashedPassword, $role);
            
            if ($userStmt->execute()) {
                // Get new user ID
                $userID = $conn->insert_id;
                
                // Insert into supervisors table
                $supervisorStmt->bind_param("isss", $userID, $nom, $prenom, $Grade);
                
                if ($supervisorStmt->execute()) {
                    $successCount++;
                    file_put_contents('import_debug.log', "Successfully added supervisor: $Email\n", FILE_APPEND);
                } else {
                    $errorCount++;
                    $errors[] = "Supervisor insertion failed for $Email: " . $conn->error;
                    file_put_contents('import_debug.log', "Supervisor insertion failed for $Email: " . $conn->error . "\n", FILE_APPEND);
                }
            } else {
                $errorCount++;
                $errors[] = "User insertion failed for $Email: " . $conn->error;
                file_put_contents('import_debug.log', "User insertion failed for $Email: " . $conn->error . "\n", FILE_APPEND);
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
    $supervisorStmt->close();
    $duplicateCheckStmt->close();
    $supervisorDuplicateCheckStmt->close();
    $conn->close();
    
    // Prepare response
    $response = [
        'success' => $successCount,
        'errors' => $errorCount,
        'status' => $successCount > 0 ? 'success' : 'error'
    ];
    
    if ($successCount > 0) {
        $response['message'] = 'imported user/s saved with success';
    } else {
        $response['message'] = 'error saving imported user/s';
    }
    
    if ($errorCount > 0) {
        $response['errorDetails'] = $errors;
    }
    
    if (!empty($duplicateUsers)) {
        $response['duplicates'] = $duplicateUsers;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // Roll back on error
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    
    file_put_contents('import_debug.log', "Exception: " . $e->getMessage() . "\n", FILE_APPEND);
    
    echo json_encode([
        'message' => 'Error: ' . $e->getMessage(),
        'status' => 'error',
        'errorDetails' => $errors
    ]);
}
?>