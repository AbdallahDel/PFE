<?php
// Include the connection file
include 'connexion.php';

// Set proper headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

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

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Database connection not established");
    }
    
    // Start session to get user ID
    session_start();
    
    // Debug session data
    error_log("Session contents: " . print_r($_SESSION, true));
    
    // Get user ID from session
    $user_id = $_SESSION['USER_ID'] ?? $_SESSION['user_id'] ?? null;
    
    // Debug info
    error_log("User ID from session: " . ($user_id ?? 'not set'));
    
    // Get the supervisor_id that corresponds to this user_id
    $supervisor_id = null;
    if ($user_id) {
        $query_supervisor = "SELECT supervisor_id FROM supervisors WHERE userID = ?";
        $stmt_supervisor = $conn->prepare($query_supervisor);
        $stmt_supervisor->bind_param("i", $user_id);
        $stmt_supervisor->execute();
        $result_supervisor = $stmt_supervisor->get_result();
        
        if ($result_supervisor && $result_supervisor->num_rows > 0) {
            $supervisor_data = $result_supervisor->fetch_assoc();
            $supervisor_id = $supervisor_data['supervisor_id'];
            error_log("Found supervisor_id: $supervisor_id for user_id: $user_id");
        } else {
            error_log("No supervisor found for user_id: $user_id");
            throw new Exception("No supervisor account found for the current user");
        }
    } else {
        throw new Exception("User not logged in or session missing");
    }
    
    // Get form data
    $titre = $_POST['titre'] ?? '';
    $niveau = $_POST['niveau'] ?? '';
    $description = $_POST['description'] ?? '';
    $contenu = $_POST['contenu'] ?? '';
    $environnement = $_POST['environnement'] ?? '';
    $motsCles = $_POST['motsCles'] ?? '';
    
    // Debug received data
    error_log("Received data: " . print_r([
        'titre' => $titre,
        'niveau' => $niveau,
        'description' => $description,
        'contenu_length' => strlen($contenu),
        'environnement_length' => strlen($environnement),
        'motsCles' => $motsCles,
        'supervisor_id' => $supervisor_id
    ], true));
    
    // Validate required fields
    if (empty($titre) || empty($niveau) || empty($description) || 
        empty($contenu) || empty($environnement) || empty($motsCles)) {
        throw new Exception("Required fields are missing");
    }
    
    // Process file upload if a file was uploaded
    $file_path = null;
    
    if (isset($_FILES['pdfFile']) && $_FILES['pdfFile']['error'] == 0) {
        $file = $_FILES['pdfFile'];
        
        // Validate file type
        $fileType = $file['type'];
        if ($fileType != 'application/pdf') {
            throw new Exception("Only PDF files are allowed");
        }
        
        // Validate file size (max 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            throw new Exception("File size exceeds the limit of 2MB");
        }
        
        // Create upload directory if it doesn't exist
        $uploadDir = '../Back-end/uploads/subjects/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception("Failed to create upload directory");
            }
        }
        
        // Generate a unique filename
        $fileName = uniqid() . '_' . $file['name'];
        $filePath = $uploadDir . $fileName;
        
        // Move the uploaded file to the destination
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception("Failed to upload file: " . $file['name']);
        }
        
        // Set the file path to be stored in the database
        $file_path = '../Back-end/uploads/subjects/' . $fileName;
    }
    
    // Insert new project with file path and type
    $query = "INSERT INTO projects (title, niveau, description, contenu, environnement, mots_cles, supervisor_id, file_path, Etat, type, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'proposed', 'intern', NOW())";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssssssss", $titre, $niveau, $description, $contenu, $environnement, $motsCles, $supervisor_id, $file_path);
    
    if ($stmt->execute()) {
        $projectId = $conn->insert_id;
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Subject submitted successfully',
            'projectId' => $projectId,
            'supervisor_id' => $supervisor_id,
            'file_path' => $file_path
        ]);
    } else {
        throw new Exception("Failed to submit subject: " . $stmt->error);
    }
    
} catch (Exception $e) {
    error_log("Error in subject submission: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'supervisor_id' => $supervisor_id ?? 'not set'
    ]);
}
?>