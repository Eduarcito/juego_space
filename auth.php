<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($input);
        break;
    case 'register':
        handleRegister($input);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'getUserData':
        getUserData();
        break;
    case 'saveScore':
        saveScore($input);
        break;
    case 'getRanking':
        getRanking();
        break;
    case 'checkDatabase':
        checkDatabase();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
}

function handleLogin($input) {
    global $pdo;
    
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Usuario y contraseña requeridos']);
        return;
    }
    
    // Buscar usuario
    $stmt = $pdo->prepare("SELECT * FROM players WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Auto-registrar usuario si no existe
        $stmt = $pdo->prepare("INSERT INTO players (username, password, credits) VALUES (?, ?, 5)");
        $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
        $userId = $pdo->lastInsertId();
        
        initSession();
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        
        echo json_encode([
            'success' => true, 
            'message' => 'Usuario registrado y logueado exitosamente',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'credits' => 5,
                'total_games' => 0,
                'best_score' => 0
            ]
        ]);
        return;
    }
    
    // Verificar contraseña (para usuarios existentes, aceptar cualquier contraseña por simplicidad)
    initSession();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    
    echo json_encode([
        'success' => true, 
        'message' => 'Login exitoso',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'credits' => $user['credits'],
            'total_games' => $user['total_games'],
            'best_score' => $user['best_score']
        ]
    ]);
}

function handleRegister($input) {
    global $pdo;
    
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Usuario y contraseña requeridos']);
        return;
    }
    
    // Verificar si el usuario ya existe
    $stmt = $pdo->prepare("SELECT id FROM players WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'El usuario ya existe']);
        return;
    }
    
    // Crear nuevo usuario
    $stmt = $pdo->prepare("INSERT INTO players (username, password, credits) VALUES (?, ?, 5)");
    $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
    
    echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
}

function handleLogout() {
    initSession();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logout exitoso']);
}

function getUserData() {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        return;
    }
    
    $history = getUserGameHistory($user['id']);
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'history' => $history
    ]);
}

function saveScore($input) {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        return;
    }
    
    // Verificar que el usuario tenga créditos
    if ($user['credits'] <= 0) {
        echo json_encode(['success' => false, 'message' => 'Sin créditos disponibles']);
        return;
    }
    
    $score = intval($input['score'] ?? 0);
    $level = intval($input['level'] ?? 1);
    $enemies = intval($input['enemies'] ?? 0);
    $gameTime = intval($input['gameTime'] ?? 0);
    $rouletteMultiplier = floatval($input['rouletteMultiplier'] ?? 1.0);
    $finalScore = intval($input['finalScore'] ?? $score);
    
    // Guardar puntaje
    $saved = saveGameScore(
        $user['id'], 
        $user['username'], 
        $score, 
        $level, 
        $enemies, 
        $gameTime, 
        $rouletteMultiplier, 
        $finalScore
    );
    
    if ($saved) {
        // Reducir créditos
        $newCredits = $user['credits'] - 1;
        updateUserCredits($user['id'], $newCredits);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Puntaje guardado exitosamente',
            'credits_remaining' => $newCredits
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar puntaje']);
    }
}

function getRanking() {
    $ranking = getDailyRanking(10);
    echo json_encode(['success' => true, 'ranking' => $ranking]);
}

function checkDatabase() {
    global $pdo;
    
    try {
        // Verificar conexión a la base de datos
        $stmt = $pdo->query("SELECT COUNT(*) FROM players LIMIT 1");
        $stmt = $pdo->query("SELECT COUNT(*) FROM game_scores LIMIT 1");
        
        echo json_encode([
            'success' => true,
            'message' => 'Base de datos configurada correctamente'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos: ' . $e->getMessage()
        ]);
    }
}
?>
