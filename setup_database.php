<?php
/**
 * Script de configuración automática de la base de datos
 * Ejecutar este archivo para crear automáticamente la base de datos y las tablas
 */

// Configuración de la base de datos
$host = 'localhost';
$username = 'root';  // Cambiar si tu usuario es diferente
$password = '';      // Cambiar si tienes contraseña
$database = 'space_racing_game';

echo "<h2>🚀 Configuración de Base de Datos - Space Racing Game</h2>\n";
echo "<pre>\n";

try {
    // Paso 1: Conectar a MySQL sin especificar base de datos
    echo "1. Conectando a MySQL...\n";
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a MySQL exitosa\n\n";

    // Paso 2: Crear la base de datos
    echo "2. Creando base de datos '$database'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Base de datos creada exitosamente\n\n";

    // Paso 3: Seleccionar la base de datos
    echo "3. Seleccionando base de datos...\n";
    $pdo->exec("USE `$database`");
    echo "✅ Base de datos seleccionada\n\n";

    // Paso 4: Crear tabla de usuarios
    echo "4. Creando tabla 'users'...\n";
    $sql_users = "
    CREATE TABLE IF NOT EXISTS `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `username` varchar(50) NOT NULL UNIQUE,
        `password` varchar(255) NOT NULL,
        `email` varchar(100) DEFAULT NULL,
        `credits` int(11) DEFAULT 100,
        `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sql_users);
    echo "✅ Tabla 'users' creada exitosamente\n\n";

    // Paso 5: Crear tabla de puntajes
    echo "5. Creando tabla 'game_scores'...\n";
    $sql_scores = "
    CREATE TABLE IF NOT EXISTS `game_scores` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `score` int(11) NOT NULL,
        `level` int(11) NOT NULL,
        `enemies_killed` int(11) NOT NULL,
        `game_time` int(11) NOT NULL,
        `roulette_multiplier` decimal(3,1) DEFAULT 1.0,
        `final_score` int(11) NOT NULL,
        `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `user_id` (`user_id`),
        CONSTRAINT `game_scores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sql_scores);
    echo "✅ Tabla 'game_scores' creada exitosamente\n\n";

    // Paso 6: Crear usuario de prueba
    echo "6. Creando usuario de prueba...\n";
    $test_password = password_hash('123456', PASSWORD_DEFAULT);
    $sql_test_user = "
    INSERT IGNORE INTO `users` (`username`, `password`, `email`, `credits`) 
    VALUES ('testuser', ?, 'test@example.com', 100)
    ";
    $stmt = $pdo->prepare($sql_test_user);
    $stmt->execute([$test_password]);
    echo "✅ Usuario de prueba creado:\n";
    echo "   Usuario: testuser\n";
    echo "   Contraseña: 123456\n";
    echo "   Créditos: 100\n\n";

    // Paso 7: Verificar configuración
    echo "7. Verificando configuración...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $user_count = $stmt->fetch()['count'];
    echo "✅ Usuarios en la base de datos: $user_count\n";

    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "✅ Tablas creadas: " . implode(', ', $tables) . "\n\n";

    echo "🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!\n\n";
    echo "Ahora puedes:\n";
    echo "1. Ir a index.html\n";
    echo "2. Usar las credenciales: testuser / 123456\n";
    echo "3. ¡Disfrutar del juego!\n\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n\n";
    echo "SOLUCIONES POSIBLES:\n";
    echo "1. Verificar que MySQL esté ejecutándose\n";
    echo "2. Verificar usuario y contraseña en este archivo\n";
    echo "3. Verificar permisos de la base de datos\n\n";
    
    echo "PASOS MANUALES:\n";
    echo "1. Abrir phpMyAdmin o MySQL Workbench\n";
    echo "2. Crear base de datos 'space_racing_game'\n";
    echo "3. Ejecutar el archivo database.sql\n";
}

echo "</pre>\n";
?>
