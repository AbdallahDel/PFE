<?php
// Include the connection file
include 'connexion.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session to get user ID
session_start();

// Get user ID from session
$user_id = $_SESSION['USER_ID'] ?? $_SESSION['user_id'] ?? null;

// Debug info
error_log("User ID from session: " . ($user_id ?? 'not set'));

if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Vous devez être connecté pour annuler vos choix'
    ]);
    exit();
}

try {
    // Check if connection is established
    if (!isset($conn) || $conn === null) {
        throw new Exception("Connexion à la base de données non établie");
    }
    
    // Get the binome_id for the current user
    $query_binome = "
        SELECT binome_id 
        FROM students 
        WHERE userID = ?
    ";
    
    $stmt_binome = $conn->prepare($query_binome);
    $stmt_binome->bind_param("i", $user_id);
    $stmt_binome->execute();
    $result_binome = $stmt_binome->get_result();
    
    if ($result_binome->num_rows === 0) {
        throw new Exception("Étudiant non trouvé ou non associé à un binôme");
    }
    
    $row_binome = $result_binome->fetch_assoc();
    $binome_id = $row_binome['binome_id'];
    
    // ENHANCED RESTRICTION: Check current project status and prevent cancellation of validated projects
    $query_check_status = "
        SELECT pc.id, pc.status, p.title, p.type, p.Etat
        FROM project_choices pc
        JOIN projects p ON pc.project_id = p.project_id
        WHERE pc.binome_id = ?
        ORDER BY pc.submitted_at DESC
    ";
    
    $stmt_check_status = $conn->prepare($query_check_status);
    $stmt_check_status->bind_param("i", $binome_id);
    $stmt_check_status->execute();
    $result_check_status = $stmt_check_status->get_result();
    
    if ($result_check_status->num_rows === 0) {
        throw new Exception("Aucun choix de projet trouvé pour votre binôme");
    }
    
    // Check each project choice for restrictions
    $validated_projects = [];
    $confirmed_projects = [];
    $pending_projects = [];
    
    while ($row = $result_check_status->fetch_assoc()) {
        if ($row['status'] === 'confirmed') {
            $confirmed_projects[] = $row;
        } elseif ($row['status'] === 'en attente' && $row['Etat'] === 'validated') {
            $validated_projects[] = $row;
        } elseif ($row['status'] === 'en attente') {
            $pending_projects[] = $row;
        }
    }
    
    // RESTRICTION 1: Cannot cancel if any project is confirmed
    if (!empty($confirmed_projects)) {
        $project_titles = array_map(function($p) { return $p['title']; }, $confirmed_projects);
        throw new Exception("Impossible d'annuler vos choix car vous avez déjà un projet confirmé: '" . implode(', ', $project_titles) . "'. Les projets confirmés ne peuvent pas être annulés.");
    }
    
    // RESTRICTION 2: Cannot cancel if any project is validated by admin (but not yet confirmed)
    if (!empty($validated_projects)) {
        $project_titles = array_map(function($p) { return $p['title']; }, $validated_projects);
        throw new Exception("Impossible d'annuler vos choix car votre projet '" . implode(', ', $project_titles) . "' a été validé par l'administration. Les projets validés ne peuvent pas être annulés.");
    }
    
    // RESTRICTION 3: Only allow cancellation of pending projects that are not validated
    if (empty($pending_projects)) {
        throw new Exception("Aucun choix en attente trouvé qui puisse être annulé");
    }
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Log what we're about to delete
    $projects_to_cancel = array_map(function($p) { return $p['title'] . ' (' . $p['type'] . ')'; }, $pending_projects);
    error_log("About to cancel projects for binome_id $binome_id: " . implode(', ', $projects_to_cancel));
    
    // Delete only pending choices that are not validated (additional safety check)
    $delete_query = "
        DELETE pc FROM project_choices pc
        JOIN projects p ON pc.project_id = p.project_id
        WHERE pc.binome_id = ? 
        AND pc.status = 'en attente' 
        AND (p.Etat IS NULL OR p.Etat != 'validated')
    ";
    
    $stmt_delete = $conn->prepare($delete_query);
    $stmt_delete->bind_param("i", $binome_id);
    $result = $stmt_delete->execute();
    
    if (!$result) {
        throw new Exception("Échec de l'annulation des choix: " . $stmt_delete->error);
    }
    
    $deleted_count = $stmt_delete->affected_rows;
    
    if ($deleted_count === 0) {
        throw new Exception("Aucun choix éligible à l'annulation n'a été trouvé");
    }
    
    // For external projects, also delete the project file if it exists
    foreach ($pending_projects as $project) {
        if ($project['type'] === 'extern' && !empty($project['file_path'])) {
            $file_path = $project['file_path'];
            if (file_exists($file_path)) {
                if (unlink($file_path)) {
                    error_log("Deleted external project file: $file_path");
                } else {
                    error_log("Failed to delete external project file: $file_path");
                }
            }
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response with details
    echo json_encode([
        'status' => 'success',
        'message' => "Tous vos choix en attente ont été annulés avec succès ($deleted_count projet(s) annulé(s))",
        'cancelled_count' => $deleted_count,
        'cancelled_projects' => $projects_to_cancel
    ]);
    
} catch (Exception $e) {
    // Rollback if transaction is active
    if ($conn && $conn->connect_error === null) {
        $conn->rollback();
    }
    
    // Return error message
    error_log("Error in cancelThemeChoices.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>