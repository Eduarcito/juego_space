<?php
/**
 * Configuración de la base de datos
 * INSTRUCCIONES: Modifica estos valores según tu configuración de MySQL
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');        // Cambiar por tu usuario de MySQL
define('DB_PASSWORD', '');            // Cambiar por tu contraseña de MySQL
define('DB_NAME', 'space_racing_game');

// Configuración adicional
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

/**
 * Función para obtener conexión a la base de datos
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USERNAME, DB_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión a la base de datos: " . $e->getMessage());
        return false;
    }
}

/**
 * Función para verificar si la base de datos está configurada
 */
function isDatabaseConfigured() {
    try {
        $pdo = getDBConnection();
        if (!$pdo) return false;
        
        // Verificar si las tablas existen
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        $users_exists = $stmt->rowCount() > 0;
        
        $stmt = $pdo->query("SHOW TABLES LIKE 'game_scores'");
        $scores_exists = $stmt->rowCount() > 0;
        
        return $users_exists && $scores_exists;
    } catch (Exception $e) {
        return false;
    }
}
?>
