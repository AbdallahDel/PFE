<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    // Debug session data
    error_log("Session contents: " . print_r($_SESSION, true));
    
    // Get user ID from session
    $user_id = $_SESSION['USER_ID'] ?? $_SESSION['user_id'] ?? null;
    
    // Debug info
    error_log("User ID from session: " . ($user_id ?? 'not set'));
    
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'User not logged in or session missing']);
        exit();
    }
    
    // Get the student_id and binome_id that corresponds to this user_id
    $student_id = null;
    $binome_id = null;
    
    $query_student = "SELECT studentID, binome_id FROM students WHERE userID = ?";
    $stmt_student = $conn->prepare($query_student);
    
    if (!$stmt_student) {
        throw new Exception("Failed to prepare student query: " . $conn->error);
    }
    
    $stmt_student->bind_param("i", $user_id);
    
    if (!$stmt_student->execute()) {
        throw new Exception("Failed to execute student query: " . $stmt_student->error);
    }
    
    $result_student = $stmt_student->get_result();
    
    if ($result_student && $result_student->num_rows > 0) {
        $student_data = $result_student->fetch_assoc();
        $student_id = $student_data['studentID'];
        $binome_id = $student_data['binome_id'];
        error_log("Found student_id: $student_id and binome_id: $binome_id for user_id: $user_id");
    } else {
        error_log("No student found for user_id: $user_id");
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'No student account found for the current user']);
        exit();
    }
    
    if (!$binome_id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Student is not associated with a binome']);
        exit();
    }
    
    // ENHANCED VALIDATION: Check if binome already has a project assigned or pending choices
    
    // 1. Check if binome already has an assigned project through the binomes table
    $query_check_assigned = "
        SELECT b.project_id, p.title, p.Etat 
        FROM binomes b
        LEFT JOIN projects p ON b.project_id = p.project_id
        WHERE b.binome_id = ? AND b.project_id IS NOT NULL
    ";
    
    $stmt_check_assigned = $conn->prepare($query_check_assigned);
    
    if (!$stmt_check_assigned) {
        throw new Exception("Failed to prepare assigned project check query: " . $conn->error);
    }
    
    $stmt_check_assigned->bind_param("i", $binome_id);
    
    if (!$stmt_check_assigned->execute()) {
        throw new Exception("Failed to check assigned projects: " . $stmt_check_assigned->error);
    }
    
    $result_check_assigned = $stmt_check_assigned->get_result();
    
    if ($result_check_assigned && $result_check_assigned->num_rows > 0) {
        $assigned_project = $result_check_assigned->fetch_assoc();
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => "Votre binôme a déjà un projet assigné: '" . $assigned_project['title'] . "' (Statut: " . $assigned_project['Etat'] . "). Vous ne pouvez pas proposer un nouveau projet externe.",
            'error_type' => 'project_already_assigned'
        ]);
        exit();
    }
    
    // 2. Check if binome has any pending choices (en attente or confirmed status)
    $query_check_choices = "
        SELECT pc.id, pc.status, p.title, p.type
        FROM project_choices pc
        LEFT JOIN projects p ON pc.project_id = p.project_id
        WHERE pc.binome_id = ? AND pc.status IN ('en attente', 'confirmed')
    ";
    
    $stmt_check_choices = $conn->prepare($query_check_choices);
    
    if (!$stmt_check_choices) {
        throw new Exception("Failed to prepare choices check query: " . $conn->error);
    }
    
    $stmt_check_choices->bind_param("i", $binome_id);
    
    if (!$stmt_check_choices->execute()) {
        throw new Exception("Failed to check pending choices: " . $stmt_check_choices->error);
    }
    
    $result_check_choices = $stmt_check_choices->get_result();
    
    if ($result_check_choices && $result_check_choices->num_rows > 0) {
        $pending_choices = [];
        while ($choice = $result_check_choices->fetch_assoc()) {
            $pending_choices[] = $choice['title'] . " (" . $choice['type'] . " - " . $choice['status'] . ")";
        }
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => "Votre binôme a déjà des choix de projets en attente: " . implode(", ", $pending_choices) . ". Vous ne pouvez pas proposer un nouveau projet externe.",
            'error_type' => 'pending_choices_exist'
        ]);
        exit();
    }
    
    // 3. Additional check: Verify if any student in the binome is already assigned to a project
    $query_check_student_projects = "
        SELECT DISTINCT p.project_id, p.title, p.Etat
        FROM students s1
        INNER JOIN students s2 ON s1.binome_id = s2.binome_id
        INNER JOIN binomes b ON s2.binome_id = b.binome_id
        INNER JOIN projects p ON b.project_id = p.project_id
        WHERE s1.userID = ?
    ";
    
    $stmt_check_student = $conn->prepare($query_check_student_projects);
    
    if (!$stmt_check_student) {
        throw new Exception("Failed to prepare student project check query: " . $conn->error);
    }
    
    $stmt_check_student->bind_param("i", $user_id);
    
    if (!$stmt_check_student->execute()) {
        throw new Exception("Failed to check student projects: " . $stmt_check_student->error);
    }
    
    $result_check_student = $stmt_check_student->get_result();
    
    if ($result_check_student && $result_check_student->num_rows > 0) {
        $student_project = $result_check_student->fetch_assoc();
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => "Vous êtes déjà assigné au projet: '" . $student_project['title'] . "' (Statut: " . $student_project['Etat'] . "). Vous ne pouvez pas proposer un nouveau projet externe.",
            'error_type' => 'student_already_assigned'
        ]);
        exit();
    }
    
    // Get form data - sanitize input
    $titre = trim($_POST['titre'] ?? '');
    $niveau = trim($_POST['niveau'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $contenu = trim($_POST['contenu'] ?? '');
    $environnement = trim($_POST['environnement'] ?? '');
    $motsCles = trim($_POST['motsCles'] ?? '');
    
    // Debug received data
    error_log("Received data: " . print_r([
        'titre' => $titre,
        'niveau' => $niveau,
        'description' => substr($description, 0, 100) . '...',
        'contenu_length' => strlen($contenu),
        'environnement_length' => strlen($environnement),
        'motsCles' => $motsCles,
        'student_id' => $student_id,
        'binome_id' => $binome_id
    ], true));
    
    // Validate required fields
    if (empty($titre) || empty($niveau) || empty($description) || 
        empty($contenu) || empty($environnement) || empty($motsCles)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Des champs obligatoires sont manquants. Veuillez remplir tous les champs requis.',
            'missing_fields' => [
                'titre' => empty($titre),
                'niveau' => empty($niveau),
                'description' => empty($description),
                'contenu' => empty($contenu),
                'environnement' => empty($environnement),
                'motsCles' => empty($motsCles)
            ]
        ]);
        exit();
    }
    
    // Process file upload
    $file_path = null;
    
    if (!isset($_FILES['pdfFile'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Aucun fichier n\'a été téléchargé']);
        exit();
    }
    
    $file = $_FILES['pdfFile'];
    error_log("File upload details: " . print_r($file, true));
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $error_message = '';
        switch ($file['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $error_message = "La taille du fichier dépasse la limite autorisée";
                break;
            case UPLOAD_ERR_PARTIAL:
                $error_message = "Le fichier n'a été que partiellement téléchargé";
                break;
            case UPLOAD_ERR_NO_FILE:
                $error_message = "Aucun fichier n'a été téléchargé";
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $error_message = "Dossier temporaire manquant";
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $error_message = "Échec de l'écriture du fichier sur le disque";
                break;
            case UPLOAD_ERR_EXTENSION:
                $error_message = "Téléchargement de fichier arrêté par extension";
                break;
            default:
                $error_message = "Erreur de téléchargement inconnue: " . $file['error'];
        }
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $error_message]);
        exit();
    }
    
    // Validate file type
    $fileType = $file['type'];
    $fileName = $file['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    if ($fileType !== 'application/pdf' && $fileExtension !== 'pdf') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Seuls les fichiers PDF sont autorisés. Type reçu: " . $fileType]);
        exit();
    }
    
    // Validate file size (max 2MB)
    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "La taille du fichier dépasse la limite de 2MB. Taille actuelle: " . round($file['size'] / (1024 * 1024), 2) . "MB"]);
        exit();
    }
    
    // Create upload directory if it doesn't exist
    $uploadDir = '../Back-end/uploads/extern_projects/';
    
    // Check if directory exists, if not create it
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception("Failed to create upload directory: " . $uploadDir);
        }
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        throw new Exception("Upload directory is not writable: " . $uploadDir);
    }
    
    // Generate a unique filename
    $uniqueFileName = uniqid() . '_extern_' . basename($fileName);
    $filePath = $uploadDir . $uniqueFileName;
    
    // Move the uploaded file to the destination
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception("Failed to upload file: " . $fileName . ". Check directory permissions.");
    }
    
    // Set the file path to be stored in the database
    $file_path = 'uploads/extern_projects/' . $uniqueFileName;
    
    // Begin transaction
    if (!$conn->autocommit(FALSE)) {
        throw new Exception("Failed to start transaction: " . $conn->error);
    }
    
    try {
        // Insert new external project with type "extern"
        $query = "INSERT INTO projects (title, niveau, description, contenu, environnement, mots_cles, supervisor_id, file_path, type, Etat, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 'extern', 'proposed', NOW())";
        $stmt = $conn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Failed to prepare project insert query: " . $conn->error);
        }
        
        $stmt->bind_param("sssssss", $titre, $niveau, $description, $contenu, $environnement, $motsCles, $file_path);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to insert project: " . $stmt->error);
        }
        
        $projectId = $conn->insert_id;
        
        if (!$projectId) {
            throw new Exception("Failed to get project ID after insertion");
        }
        
        // Insert into project_choices table with status "en attente"
        $choice_query = "INSERT INTO project_choices (binome_id, project_id, status, submitted_at) 
                        VALUES (?, ?, 'en attente', NOW())";
        $stmt_choice = $conn->prepare($choice_query);
        
        if (!$stmt_choice) {
            throw new Exception("Failed to prepare choice insert query: " . $conn->error);
        }
        
        $stmt_choice->bind_param("ii", $binome_id, $projectId);
        
        if (!$stmt_choice->execute()) {
            throw new Exception("Failed to create project choice: " . $stmt_choice->error);
        }
        
        // Commit transaction
        if (!$conn->commit()) {
            throw new Exception("Failed to commit transaction: " . $conn->error);
        }
        
        // Re-enable autocommit
        $conn->autocommit(TRUE);
        
        // Log the successful submission
        error_log("External project submitted successfully: Project ID $projectId by Student ID $student_id, Binome ID $binome_id");
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Projet externe soumis avec succès',
            'projectId' => $projectId,
            'student_id' => $student_id,
            'binome_id' => $binome_id,
            'file_path' => $file_path
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        $conn->autocommit(TRUE);
        throw $e;
    }
    
} catch (Exception $e) {
    // Clean up uploaded file if it exists and there was an error
    if (isset($filePath) && file_exists($filePath)) {
        unlink($filePath);
    }
    
    error_log("Error in external project submission: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.',
        'debug' => [
            'user_id' => $user_id ?? 'not set',
            'student_id' => $student_id ?? 'not set',
            'binome_id' => $binome_id ?? 'not set'
        ]
    ]);
} finally {
    // Close prepared statements
    if (isset($stmt_student)) $stmt_student->close();
    if (isset($stmt_check_assigned)) $stmt_check_assigned->close();
    if (isset($stmt_check_choices)) $stmt_check_choices->close();
    if (isset($stmt_check_student)) $stmt_check_student->close();
    if (isset($stmt)) $stmt->close();
    if (isset($stmt_choice)) $stmt_choice->close();
}
?>