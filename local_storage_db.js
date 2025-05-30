/**
 * Sistema de base de datos local para Space Racing Game
 * Simula una base de datos usando localStorage cuando MySQL no está disponible
 */

class LocalStorageDB {
    constructor() {
        this.initializeDB();
    }

    initializeDB() {
        // Inicializar estructura de datos si no existe
        if (!localStorage.getItem('space_racing_players')) {
            localStorage.setItem('space_racing_players', JSON.stringify([]));
        }
        if (!localStorage.getItem('space_racing_scores')) {
            localStorage.setItem('space_racing_scores', JSON.stringify([]));
        }
        
        // Crear usuario de prueba si no existe
        this.createTestUser();
    }

    createTestUser() {
        const players = this.getPlayers();
        const testUserExists = players.find(p => p.username === 'testuser');
        
        if (!testUserExists) {
            const testUser = {
                id: 1,
                username: 'testuser',
                password: 'hashed_123456', // Simulamos hash
                email: 'test@example.com',
                credits: 100,
                best_score: 0,
                total_games: 0,
                created_at: new Date().toISOString()
            };
            players.push(testUser);
            this.savePlayers(players);
            console.log('Usuario de prueba creado: testuser / 123456');
        }
    }

    getPlayers() {
        return JSON.parse(localStorage.getItem('space_racing_players') || '[]');
    }

    savePlayers(players) {
        localStorage.setItem('space_racing_players', JSON.stringify(players));
    }

    getScores() {
        return JSON.parse(localStorage.getItem('space_racing_scores') || '[]');
    }

    saveScores(scores) {
        localStorage.setItem('space_racing_scores', JSON.stringify(scores));
    }

    // Simular login
    login(username, password) {
        const players = this.getPlayers();
        let user = players.find(p => p.username === username);
        
        if (!user) {
            // Auto-registrar usuario
            const newUser = {
                id: Date.now(),
                username: username,
                password: 'hashed_' + password,
                email: username + '@example.com',
                credits: 100,
                best_score: 0,
                total_games: 0,
                created_at: new Date().toISOString()
            };
            players.push(newUser);
            this.savePlayers(players);
            user = newUser;
        }
        
        return {
            success: true,
            message: 'Login exitoso',
            user: {
                id: user.id,
                username: user.username,
                credits: user.credits,
                best_score: user.best_score,
                total_games: user.total_games
            }
        };
    }

    // Guardar puntaje
    saveScore(userId, username, score, level, enemies, gameTime, rouletteMultiplier, finalScore) {
        const players = this.getPlayers();
        const userIndex = players.findIndex(p => p.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const user = players[userIndex];
        
        if (user.credits <= 0) {
            return { success: false, message: 'Sin créditos disponibles' };
        }

        // Guardar puntaje
        const scores = this.getScores();
        const newScore = {
            id: Date.now(),
            player_id: userId,
            username: username,
            score: score,
            level_reached: level,
            enemies_killed: enemies,
            game_time: gameTime,
            roulette_multiplier: rouletteMultiplier,
            final_score: finalScore,
            credits_used: 1,
            played_at: new Date().toISOString()
        };
        scores.push(newScore);
        this.saveScores(scores);

        // Actualizar usuario
        user.credits -= 1;
        user.total_games += 1;
        if (finalScore > user.best_score) {
            user.best_score = finalScore;
        }
        players[userIndex] = user;
        this.savePlayers(players);

        return {
            success: true,
            message: 'Puntaje guardado exitosamente',
            credits_remaining: user.credits
        };
    }

    // Obtener ranking
    getRanking(limit = 10) {
        const players = this.getPlayers();
        return players
            .filter(p => p.best_score > 0)
            .sort((a, b) => b.best_score - a.best_score)
            .slice(0, limit)
            .map(p => ({
                username: p.username,
                best_score: p.best_score,
                total_games: p.total_games
            }));
    }

    // Obtener historial del usuario
    getUserHistory(userId, limit = 5) {
        const scores = this.getScores();
        return scores
            .filter(s => s.player_id === userId)
            .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
            .slice(0, limit);
    }

    // Verificar estado de la base de datos
    checkDatabase() {
        try {
            const players = this.getPlayers();
            const scores = this.getScores();
            return {
                success: true,
                message: `Base de datos local funcionando. ${players.length} usuarios, ${scores.length} puntajes.`
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error en base de datos local: ' + error.message
            };
        }
    }

    // Obtener datos del usuario actual
    getCurrentUser(userId) {
        const players = this.getPlayers();
        return players.find(p => p.id === userId);
    }
}

// Instancia global
window.localDB = new LocalStorageDB();
