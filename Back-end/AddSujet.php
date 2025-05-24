<?php
ini_set('display_errors', 0); // Turn off HTML error display
ini_set('log_errors', 1);     // Log errors to PHP log

// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");



ini_set('display_errors', 0); // Turn off HTML error display
ini_set('log_errors', 1);     // Log errors to PHP log
// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

error_log("AddSujet.php script started");

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Get form data

    error_log("POST data: " . json_encode($_POST));
    error_log("FILES data: " . json_encode($_FILES));

    $type = $_POST['type'] ?? 'intern';
    $titre = $_POST['titre'] ?? '';
    $niveau = $_POST['niveau'] ?? 'licence';
    $encadrant = $_POST['encadrant'] ?? '';
    $etat = $_POST['etat'] ?? 'disponible';
    $description = $_POST['description'] ?? '';
    
    // Validate required fields
    if (empty($titre) || empty($niveau) || empty($encadrant)) {
        throw new Exception("Required fields are missing");
    }
    
    // Find or create supervisor
    $supervisor_id = null;
    $supervisorCheck = $conn->prepare("SELECT supervisor_id FROM supervisors WHERE CONCAT(nom, ' ', prenom) = ?");
    $supervisorCheck->bind_param("s", $encadrant);
    $supervisorCheck->execute();
    $supervisorResult = $supervisorCheck->get_result();
    
    if ($supervisorResult->num_rows > 0) {
        $supervisor = $supervisorResult->fetch_assoc();
        $supervisor_id = $supervisor['supervisor_id'];
    } else {
        // Parse supervisor name into first and last name
        $nameParts = explode(' ', $encadrant, 2);
        $nom = $nameParts[0] ?? '';
        $prenom = $nameParts[1] ?? '';
        
        // Insert new supervisor
        $supervisorInsert = $conn->prepare("INSERT INTO supervisors (nom, prenom) VALUES (?, ?)");
        $supervisorInsert->bind_param("ss", $nom, $prenom);
        $supervisorInsert->execute();
        $supervisor_id = $conn->insert_id;
    }
    
    // Map etat to database values
    $dbEtat = 'proposed';
    if ($etat === 'attribué') {
        $dbEtat = 'assigned';
    } else if ($etat === 'en cours') {
        $dbEtat = 'in_progress';
    } else if ($etat === 'terminé') {
        $dbEtat = 'completed';
    } else if ($etat === 'rejeté') {
        $dbEtat = 'rejected';
    }
    
    // Process file upload if a file was sent
    $file_path = null;
    $uploadDir = '../Back-end/uploads/subjects/';
    $filename = null;
    
    if (isset($_FILES['pdfFile']) && $_FILES['pdfFile']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['pdfFile'];
        error_log("Processing file: " . $file['name']);
        
        // Validate file type
        $allowedTypes = ['application/pdf'];
        $fileType = '';
        
        // Try to determine file type
        if (function_exists('mime_content_type')) {
            $fileType = mime_content_type($file['tmp_name']);
        } else {
            // Fallback to checking file extension
            $fileInfo = pathinfo($file['name']);
            if (strtolower($fileInfo['extension']) === 'pdf') {
                $fileType = 'application/pdf';
            }
        }
        
        error_log("File type: " . $fileType);
        
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception("Invalid file type. Only PDF files are allowed.");
        }
        
        // Validate file size (2MB max)
        if ($file['size'] > 2 * 1024 * 1024) {
            throw new Exception("File size exceeds maximum limit of 2MB.");
        }
        
        // Create upload directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception("Failed to create upload directory at: " . $uploadDir);
            }
        }
        
        // Generate unique filename
        $filename = uniqid('sujet_') . '.pdf';
        $fullPath = $uploadDir . $filename;
        error_log("Trying to move file to: " . $fullPath);
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            $file_path = '../Back-end/uploads/subjects/' . $filename; // Store relative path in DB
            error_log("File moved successfully. DB path: " . $file_path);
        } else {
            $uploadError = error_get_last();
            error_log("File move failed: " . ($uploadError ? $uploadError['message'] : 'Unknown error'));
            throw new Exception("Failed to save file. Check server permissions.");
        }
    } else if (isset($_FILES['pdfFile'])) {
        $errorCodes = [
            0 => 'UPLOAD_ERR_OK',
            1 => 'UPLOAD_ERR_INI_SIZE',
            2 => 'UPLOAD_ERR_FORM_SIZE',
            3 => 'UPLOAD_ERR_PARTIAL',
            4 => 'UPLOAD_ERR_NO_FILE',
            6 => 'UPLOAD_ERR_NO_TMP_DIR',
            7 => 'UPLOAD_ERR_CANT_WRITE',
            8 => 'UPLOAD_ERR_EXTENSION',
        ];
        $errorCode = $_FILES['pdfFile']['error'];
        $errorMessage = $errorCodes[$errorCode] ?? 'Unknown error';
        error_log("File upload error: " . $errorMessage . " (code: " . $errorCode . ")");
    }
    
    // Insert new project
    $stmt = $conn->prepare("INSERT INTO projects (title, Etat,niveau, description, supervisor_id, created_at, file_path,type) VALUES (?, ?, ?, ?,?, NOW(), ?,?)");
    
    // For debugging, log the values
    error_log("Inserting with values: Title={$titre}, Etat={$dbEtat},niveau={$niveau}, Description={$description}, SupervisorID={$supervisor_id}, FilePath={$file_path},type={$type}");
    
    $stmt->bind_param("ssssiss", $titre, $dbEtat,$niveau, $description, $supervisor_id, $file_path,$type);
    
    if ($stmt->execute()) {
        $sujetID = $conn->insert_id;
        
        echo json_encode([
            'status' => 'success',
            'message' => 'sujet added with success',
            'sujetID' => $sujetID,
            'file_path' => $file_path
        ]);
    } else {
        // If insertion fails and we uploaded a file, clean it up
        if ($file_path && file_exists($uploadDir . $filename)) {
            unlink($uploadDir . $filename);
        }
        throw new Exception("Failed to add sujet: " . $stmt->error);
    }
    
} catch (Exception $e) {
    // Clean up uploaded file if it exists and there was an error
    if (isset($filename) && isset($uploadDir) && file_exists($uploadDir . $filename)) {
        unlink($uploadDir . $filename);
    }
    
    // Log the error
    error_log("AddSujet Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>