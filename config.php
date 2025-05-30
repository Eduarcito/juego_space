<?php
/**
 * Configuración de la base de datos MySQL para VPS con cPanel
 * Cambie los valores según su configuración en cPanel
 */
$host = 'localhost'; // Cambiar si es necesario
$dbname = 'nombre_base_de_datos'; // Cambiar por el nombre de la base creada en cPanel
$username = 'usuario_mysql'; // Cambiar por el usuario MySQL creado en cPanel
$password = 'contraseña_mysql'; // Cambiar por la contraseña del usuario MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}

// Función para inicializar sesión
function initSession() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
}

// Función para verificar si el usuario está logueado
function isLoggedIn() {
    initSession();
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

// Función para obtener datos del usuario actual
function getCurrentUser() {
    global $pdo;
    if (!isLoggedIn()) return null;
    
    $stmt = $pdo->prepare("SELECT * FROM players WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

// Función para actualizar créditos del usuario
function updateUserCredits($userId, $credits) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE players SET credits = ? WHERE id = ?");
    return $stmt->execute([$credits, $userId]);
}

// Función para guardar puntaje
function saveGameScore($playerId, $username, $score, $level, $enemies, $gameTime, $rouletteMultiplier, $finalScore) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        INSERT INTO game_scores 
        (player_id, username, score, level_reached, enemies_killed, game_time, roulette_multiplier, final_score, credits_used) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    ");
    
    $result = $stmt->execute([$playerId, $username, $score, $level, $enemies, $gameTime, $rouletteMultiplier, $finalScore]);
    
    // Actualizar mejor puntaje del jugador
    $stmt = $pdo->prepare("UPDATE players SET best_score = GREATEST(best_score, ?), total_games = total_games + 1 WHERE id = ?");
    $stmt->execute([$finalScore, $playerId]);
    
    return $result;
}

// Función para obtener ranking diario
function getDailyRanking($limit = 10) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT 
            p.username,
            MAX(gs.final_score) as best_score,
            COUNT(gs.id) as total_games,
            MAX(gs.played_at) as last_played
        FROM players p
        LEFT JOIN game_scores gs ON p.id = gs.player_id 
        WHERE DATE(gs.played_at) = CURDATE()
        GROUP BY p.id, p.username
        ORDER BY best_score DESC, total_games DESC
        LIMIT ?
    ");
    
    $stmt->execute([$limit]);
    return $stmt->fetchAll();
}

// Función para obtener historial de partidas del usuario
function getUserGameHistory($userId, $limit = 5) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT * FROM game_scores 
        WHERE player_id = ? 
        ORDER BY played_at DESC 
        LIMIT ?
    ");
    
    $stmt->execute([$userId, $limit]);
    return $stmt->fetchAll();
}
?>
