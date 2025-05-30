-- Base de datos para Space Racing Game
CREATE DATABASE IF NOT EXISTS space_racing_game;
USE space_racing_game;

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    credits INT DEFAULT 5,
    total_games INT DEFAULT 0,
    best_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partidas/puntajes
CREATE TABLE IF NOT EXISTS game_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    level_reached INT NOT NULL,
    enemies_killed INT NOT NULL,
    game_time INT NOT NULL,
    roulette_multiplier DECIMAL(3,1) DEFAULT 1.0,
    final_score INT NOT NULL,
    credits_used INT DEFAULT 1,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Tabla de ranking diario
CREATE TABLE IF NOT EXISTS daily_ranking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    best_score INT NOT NULL,
    total_games INT NOT NULL,
    ranking_date DATE NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_date (player_id, ranking_date)
);

-- Insertar algunos jugadores de prueba
INSERT IGNORE INTO players (username, password, credits) VALUES 
('admin', 'admin123', 5),
('player1', 'pass123', 5),
('player2', 'pass123', 5);
