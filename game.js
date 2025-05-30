// Variables del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Usuario actual
let currentUser = null;

// Estado del juego
let gameState = {
    score: 0,
    level: 1,
    health: 100,
    enemiesKilled: 0,
    gameTime: 0,
    paused: false,
    gameOver: false,
    powerUps: {
        shield: false,
        speed: false,
        multiShot: false
    }
};

// Verificar usuario al cargar
document.addEventListener('DOMContentLoaded', function() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('Usuario cargado:', currentUser);
        
        // Verificar créditos antes de permitir jugar
        if (currentUser.credits <= 0) {
            alert('No tienes créditos suficientes para jugar. Contacta al administrador.');
            window.location.href = 'index.html';
            return;
        }
    } else {
        // Redirigir al login si no hay usuario
        window.location.href = 'index.html';
        return;
    }
    loadImages();
});

// Jugador
let player;

// Función para ajustar el tamaño del canvas
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Inicializar o actualizar posición del jugador
    if (!player) {
        player = {
            x: canvas.width / 2 - 25,
            y: canvas.height - 80,
            width: 50,
            height: 50,
            speed: 5,
            bullets: [],
            lastShot: 0
        };
    } else {
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height - 20;
    }
}

// Arrays de entidades
let enemies = [];
let powerUps = [];
let particles = [];
let explosions = [];

// Imágenes
const images = {};
const imageUrls = {
    player: 'Images/rocket3.gif',
    enemy: 'Images/enemy.png',
    monster1: 'Images/monsters/1.png',
    monster2: 'Images/monsters/2.png',
    monster3: 'Images/monsters/3.png',
    monster4: 'Images/monsters/4.png',
    monster5: 'Images/monsters/5.png',
    monster6: 'Images/monsters/6.png',
    monster7: 'Images/monsters/7.png',
    monster8: 'Images/monsters/8.png'
};

// Cargar imágenes
function loadImages() {
    let loadedCount = 0;
    const totalImages = Object.keys(imageUrls).length;
    
    for (let key in imageUrls) {
        images[key] = new Image();
        images[key].onload = () => {
            console.log(`Imagen cargada: ${key}`);
            loadedCount++;
            if (loadedCount === totalImages) {
                console.log('Todas las imágenes cargadas, iniciando juego...');
                startGame();
            }
        };
        images[key].onerror = () => {
            console.error(`Error al cargar imagen: ${key} - ${imageUrls[key]}`);
        };
        images[key].src = imageUrls[key];
    }
}

// Inicializar juego
function startGame() {
    // Ajustar tamaño inicial del canvas
    resizeCanvas();
    
    // Ajustar canvas cuando cambie el tamaño de la ventana
    window.addEventListener('resize', resizeCanvas);
    
    // Iniciar sistemas del juego
    createBackgroundParticles();
    gameLoop();
    setInterval(updateGameTime, 1000);
    setInterval(spawnEnemy, 1000);
    setInterval(spawnPowerUp, 10000);
    
    // Dibujar ruleta inicial
    dibujarRuleta();
}

// Controles
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        shoot();
    }
    if (e.key === 'p' || e.key === 'P') {
        gameState.paused = !gameState.paused;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Movimiento del jugador
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed * (gameState.powerUps.speed ? 1.5 : 1);
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed * (gameState.powerUps.speed ? 1.5 : 1);
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed * (gameState.powerUps.speed ? 1.5 : 1);
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed * (gameState.powerUps.speed ? 1.5 : 1);
    }
}

// Disparar
function shoot() {
    const now = Date.now();
    if (now - player.lastShot > 200) {
        if (gameState.powerUps.multiShot) {
            // Triple disparo
            player.bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: 8
            });
            player.bullets.push({
                x: player.x + player.width / 2 - 2 - 15,
                y: player.y,
                width: 4,
                height: 10,
                speed: 8
            });
            player.bullets.push({
                x: player.x + player.width / 2 - 2 + 15,
                y: player.y,
                width: 4,
                height: 10,
                speed: 8
            });
        } else {
            // Disparo normal
            player.bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: 8
            });
        }
        player.lastShot = now;
    }
}

// Actualizar balas
function updateBullets() {
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        bullet.y -= bullet.speed;
        
        if (bullet.y < 0) {
            player.bullets.splice(i, 1);
        }
    }
}

// Generar enemigos
function spawnEnemy() {
    if (gameState.gameOver || gameState.paused) return;
    
    const enemyTypes = ['enemy', 'monster1', 'monster2', 'monster3', 'monster4', 'monster5', 'monster6', 'monster7', 'monster8'];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 2 + gameState.level * 0.5,
        type: type,
        health: type === 'enemy' ? 1 : 2
    });
}

// Actualizar enemigos
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        
        // Eliminar enemigos que salen de pantalla
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Colisión con balas
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            const bullet = player.bullets[j];
            if (collision(bullet, enemy)) {
                player.bullets.splice(j, 1);
                enemy.health--;
                
                if (enemy.health <= 0) {
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    enemies.splice(i, 1);
                    gameState.score += 10 * gameState.level;
                    gameState.enemiesKilled++;
                    
                    // Subir nivel cada 10 enemigos
                    if (gameState.enemiesKilled % 10 === 0) {
                        gameState.level++;
                    }
                }
                break;
            }
        }
        
        // Colisión con jugador
        if (collision(player, enemy) && !gameState.powerUps.shield) {
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            enemies.splice(i, 1);
            gameState.health -= 20;
            
            if (gameState.health <= 0) {
                gameOver();
            }
        }
    }
}

// Generar power-ups
function spawnPowerUp() {
    if (gameState.gameOver || gameState.paused) return;
    
    const types = ['shield', 'speed', 'multiShot', 'health'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 3,
        type: type
    });
}

// Actualizar power-ups
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;
        
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            continue;
        }
        
        if (collision(player, powerUp)) {
            activatePowerUp(powerUp.type);
            powerUps.splice(i, 1);
        }
    }
}

// Activar power-up
function activatePowerUp(type) {
    switch(type) {
        case 'shield':
            gameState.powerUps.shield = true;
            setTimeout(() => gameState.powerUps.shield = false, 5000);
            break;
        case 'speed':
            gameState.powerUps.speed = true;
            setTimeout(() => gameState.powerUps.speed = false, 5000);
            break;
        case 'multiShot':
            gameState.powerUps.multiShot = true;
            setTimeout(() => gameState.powerUps.multiShot = false, 5000);
            break;
        case 'health':
            gameState.health = Math.min(100, gameState.health + 30);
            break;
    }
}

// Crear explosión
function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            color: `hsl(${Math.random() * 60}, 100%, 50%)`
        });
    }
}

// Actualizar partículas
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Detección de colisiones
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Dibujar
function draw() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo estrellado
    drawStars();
    
    // Jugador
    if (images.player.complete) {
        ctx.save();
        if (gameState.powerUps.shield) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
        }
        ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
        ctx.restore();
    }
    
    // Balas
    ctx.fillStyle = '#00ff00';
    player.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Enemigos
    enemies.forEach(enemy => {
        if (images[enemy.type] && images[enemy.type].complete) {
            ctx.drawImage(images[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
    
    // Power-ups
    powerUps.forEach(powerUp => {
        ctx.save();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fillStyle = getPowerUpColor(powerUp.type);
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        ctx.restore();
    });
    
    // Partículas
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 2, 2);
    });
    
    // Pausa
    if (gameState.paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Orbitron, Exo 2, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSA', canvas.width/2, canvas.height/2);
    }
}

// Dibujar estrellas de fondo
function drawStars() {
    ctx.fillStyle = 'white';
    for (let i = 0; i < 100; i++) {
        const x = (i * 7) % canvas.width;
        const y = (i * 11 + Date.now() * 0.1) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

// Color de power-up
function getPowerUpColor(type) {
    switch(type) {
        case 'shield': return '#00ffff';
        case 'speed': return '#ffff00';
        case 'multiShot': return '#ff00ff';
        case 'health': return '#00ff00';
        default: return '#ffffff';
    }
}

// Actualizar UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('enemiesKilled').textContent = gameState.enemiesKilled;
    document.getElementById('gameTime').textContent = gameState.gameTime + 's';
    
    const healthPercent = Math.max(0, gameState.health);
    document.getElementById('healthFill').style.width = healthPercent + '%';
    
    document.getElementById('shieldStatus').textContent = gameState.powerUps.shield ? 'Activo' : 'Inactivo';
    document.getElementById('shieldStatus').className = gameState.powerUps.shield ? 'power-up-active' : '';
    
    document.getElementById('speedStatus').textContent = gameState.powerUps.speed ? 'Aumentada' : 'Normal';
    document.getElementById('speedStatus').className = gameState.powerUps.speed ? 'power-up-active' : '';
    
    document.getElementById('multiShotStatus').textContent = gameState.powerUps.multiShot ? 'Activo' : 'Inactivo';
    document.getElementById('multiShotStatus').className = gameState.powerUps.multiShot ? 'power-up-active' : '';
}

// Actualizar tiempo
function updateGameTime() {
    if (!gameState.gameOver && !gameState.paused) {
        gameState.gameTime++;
    }
}

// Game Over
function gameOver() {
    gameState.gameOver = true;
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('finalEnemies').textContent = gameState.enemiesKilled;
    document.getElementById('finalTime').textContent = gameState.gameTime + 's';
    
    document.getElementById('gameOverModal').style.display = 'block';
}

// Función para guardar puntaje en la base de datos
async function saveGameScore(finalScore, rouletteMultiplier = 1.0) {
    if (!currentUser) {
        console.error('No hay usuario logueado');
        return false;
    }

    try {
        const response = await fetch('auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveScore',
                score: gameState.score,
                level: gameState.level,
                enemies: gameState.enemiesKilled,
                gameTime: gameState.gameTime,
                rouletteMultiplier: rouletteMultiplier,
                finalScore: finalScore
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('Puntaje guardado exitosamente');
            // Actualizar créditos del usuario
            currentUser.credits = data.credits_remaining;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return true;
        } else {
            console.error('Error al guardar puntaje:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error de conexión al guardar puntaje:', error);
        return false;
    }
}

// Reiniciar juego
function resetGame() {
    gameState = {
        score: 0,
        level: 1,
        health: 100,
        enemiesKilled: 0,
        gameTime: 0,
        paused: false,
        gameOver: false,
        powerUps: {
            shield: false,
            speed: false,
            multiShot: false
        }
    };
    
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    player.bullets = [];
    
    enemies = [];
    powerUps = [];
    particles = [];
    
    document.getElementById('gameOverModal').style.display = 'none';
}

// Loop principal del juego
function gameLoop() {
    if (!gameState.gameOver && !gameState.paused) {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updatePowerUps();
        updateParticles();
    }
    
    draw();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('playAgainBtn').addEventListener('click', resetGame);

// Ruleta - Funcionalidad corregida
const ruletaModal = document.getElementById('ruletaModal');
const girarBtn = document.getElementById('girarBtn');
const resultadoRuleta = document.getElementById('resultadoRuleta');
const cerrarRuletaBtn = document.getElementById('cerrarRuletaBtn');
const ruletaCanvas = document.getElementById('ruletaCanvas');
const ruletaCtx = ruletaCanvas.getContext('2d');

const segmentos = [
    { texto: 'x3', multiplicador: 3, color: '#4CAF50' },
    { texto: 'x2', multiplicador: 2, color: '#8BC34A' },
    { texto: 'x1.5', multiplicador: 1.5, color: '#CDDC39' },
    { texto: 'x1', multiplicador: 1, color: '#FFC107' },
    { texto: 'x0.5', multiplicador: 0.5, color: '#FF9800' },
    { texto: 'x0', multiplicador: 0, color: '#F44336' }
];

const radio = 150;
let anguloActual = 0;
let velocidad = 0;
let animando = false;

function dibujarRuleta() {
    const anguloSegmento = (2 * Math.PI) / segmentos.length;
    ruletaCtx.clearRect(0, 0, ruletaCanvas.width, ruletaCanvas.height);
    
    // Dibujar segmentos
    for (let i = 0; i < segmentos.length; i++) {
        const anguloInicio = anguloSegmento * i + anguloActual;
        ruletaCtx.beginPath();
        ruletaCtx.moveTo(radio, radio);
        ruletaCtx.arc(radio, radio, radio - 10, anguloInicio, anguloInicio + anguloSegmento);
        ruletaCtx.fillStyle = segmentos[i].color;
        ruletaCtx.fill();
        ruletaCtx.strokeStyle = '#000';
        ruletaCtx.lineWidth = 2;
        ruletaCtx.stroke();
        
        // Texto del segmento
        ruletaCtx.save();
        ruletaCtx.translate(
            radio + Math.cos(anguloInicio + anguloSegmento / 2) * (radio - 40),
            radio + Math.sin(anguloInicio + anguloSegmento / 2) * (radio - 40)
        );
        ruletaCtx.rotate(anguloInicio + anguloSegmento / 2 + Math.PI / 2);
        ruletaCtx.fillStyle = 'white';
        ruletaCtx.font = 'bold 20px Orbitron, Exo 2, Arial, sans-serif';
        ruletaCtx.textAlign = 'center';
        ruletaCtx.strokeStyle = '#000';
        ruletaCtx.lineWidth = 3;
        ruletaCtx.strokeText(segmentos[i].texto, 0, 5);
        ruletaCtx.fillText(segmentos[i].texto, 0, 5);
        ruletaCtx.restore();
    }
    
    // Dibujar flecha indicadora CORREGIDA
    ruletaCtx.save();
    ruletaCtx.translate(radio, radio);
    // Flecha fija apuntando hacia arriba (posición 0 grados)
    ruletaCtx.beginPath();
    ruletaCtx.moveTo(0, -radio + 5);
    ruletaCtx.lineTo(-15, -radio + 25);
    ruletaCtx.lineTo(15, -radio + 25);
    ruletaCtx.closePath();
    ruletaCtx.fillStyle = '#FFD700';
    ruletaCtx.fill();
    ruletaCtx.strokeStyle = '#000';
    ruletaCtx.lineWidth = 3;
    ruletaCtx.stroke();
    
    // Sombra de la flecha
    ruletaCtx.shadowColor = 'rgba(0,0,0,0.5)';
    ruletaCtx.shadowBlur = 5;
    ruletaCtx.shadowOffsetX = 2;
    ruletaCtx.shadowOffsetY = 2;
    ruletaCtx.fill();
    ruletaCtx.restore();
}

function animar() {
    if (!animando) return;
    velocidad *= 0.98; // Desaceleración más gradual
    anguloActual += velocidad;
    anguloActual %= 2 * Math.PI;
    dibujarRuleta();
    
    if (velocidad < 0.001) {
        animando = false;
        calcularResultado();
    } else {
        requestAnimationFrame(animar);
    }
}

async function calcularResultado() {
    const anguloSegmento = (2 * Math.PI) / segmentos.length;
    // Calcular qué segmento está en la posición de la flecha (arriba)
    // La flecha apunta hacia arriba (0 grados), así que calculamos el segmento en esa posición
    let anguloFlecha = (2 * Math.PI - anguloActual) % (2 * Math.PI);
    let indice = Math.floor(anguloFlecha / anguloSegmento);
    
    // Asegurar que el índice esté en el rango correcto
    indice = (indice + segmentos.length) % segmentos.length;
    
    const resultado = segmentos[indice];
    const puntuacionAnterior = gameState.score;
    const nuevaPuntuacion = Math.floor(gameState.score * resultado.multiplicador);
    
    gameState.score = nuevaPuntuacion;
    
    // Guardar el puntaje en la base de datos
    const saved = await saveGameScore(nuevaPuntuacion, resultado.multiplicador);
    
    resultadoRuleta.innerHTML = `
        <div style="background: rgba(255,215,0,0.2); padding: 15px; border-radius: 10px; border: 1px solid #ffd700;">
            <h4 style="color: #ffd700; margin-bottom: 10px;">🎰 Resultado de la Ruleta</h4>
            <p><strong>Multiplicador:</strong> ${resultado.texto}</p>
            <p><strong>Puntuación anterior:</strong> ${puntuacionAnterior}</p>
            <p><strong>Puntuación final:</strong> <span style="color: #00ff00; font-size: 1.2em;">${nuevaPuntuacion}</span></p>
            ${saved ? '<p style="color: #00ff00; font-size: 0.9em;">✅ Puntaje guardado exitosamente</p>' : '<p style="color: #ff6b6b; font-size: 0.9em;">❌ Error al guardar puntaje</p>'}
            <p style="color: #ffd700; font-size: 0.9em;">💰 Créditos restantes: ${currentUser ? currentUser.credits : 'N/A'}</p>
        </div>
    `;
    
    // Actualizar la puntuación final en el modal de game over
    document.getElementById('finalScore').textContent = nuevaPuntuacion;
    
    cerrarRuletaBtn.style.display = 'inline-block';
    girarBtn.style.display = 'none';
}

// Event listeners de la ruleta
document.getElementById('ruletaBtn').addEventListener('click', function() {
    document.getElementById('gameOverModal').style.display = 'none';
    ruletaModal.style.display = 'block';
    // Resetear estado de la ruleta
    girarBtn.style.display = 'inline-block';
    cerrarRuletaBtn.style.display = 'none';
    resultadoRuleta.innerHTML = '';
    animando = false;
    velocidad = 0;
    dibujarRuleta();
    
    // Asegurar que el modal esté en el top
    ruletaModal.scrollTop = 0;
});

girarBtn.addEventListener('click', function() {
    if (animando) return;
    velocidad = Math.random() * 0.3 + 0.4; // Velocidad inicial aleatoria
    animando = true;
    resultadoRuleta.innerHTML = '<p style="color: #ffd700;">🎲 Girando...</p>';
    cerrarRuletaBtn.style.display = 'none';
    girarBtn.disabled = true;
    animar();
});

cerrarRuletaBtn.addEventListener('click', function() {
    ruletaModal.style.display = 'none';
    document.getElementById('gameOverModal').style.display = 'block';
    girarBtn.style.display = 'inline-block';
    girarBtn.disabled = false;
    cerrarRuletaBtn.style.display = 'none';
});

// Cerrar modal de ruleta con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (ruletaModal.style.display === 'block') {
            ruletaModal.style.display = 'none';
            document.getElementById('gameOverModal').style.display = 'block';
            girarBtn.style.display = 'inline-block';
            girarBtn.disabled = false;
            cerrarRuletaBtn.style.display = 'none';
        }
    }
});

// Prevenir scroll del body cuando el modal está abierto
ruletaModal.addEventListener('wheel', function(e) {
    e.stopPropagation();
});

// Efectos de partículas de fondo
function createBackgroundParticles() {
    setInterval(() => {
        if (particles.length < 50) {
            particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                life: 100,
                color: `rgba(255,255,255,${Math.random() * 0.5})`
            });
        }
    }, 200);
}

// Efectos de sonido simulados (visual feedback)
function playSound(type) {
    const soundIndicator = document.createElement('div');
    soundIndicator.style.position = 'fixed';
    soundIndicator.style.top = '50px';
    soundIndicator.style.left = '50%';
    soundIndicator.style.transform = 'translateX(-50%)';
    soundIndicator.style.color = '#00ff00';
    soundIndicator.style.fontSize = '20px';
    soundIndicator.style.fontWeight = 'bold';
    soundIndicator.style.zIndex = '9999';
    soundIndicator.style.pointerEvents = 'none';
    
    switch(type) {
        case 'shoot':
            soundIndicator.textContent = '💥 PEW!';
            break;
        case 'explosion':
            soundIndicator.textContent = '💥 BOOM!';
            break;
        case 'powerup':
            soundIndicator.textContent = '⚡ POWER UP!';
            break;
    }
    
    document.body.appendChild(soundIndicator);
    
    setTimeout(() => {
        soundIndicator.remove();
    }, 1000);
}

// Mejorar la función de disparo con efectos
const originalShoot = shoot;
shoot = function() {
    originalShoot();
    if (Date.now() - player.lastShot <= 200) {
        playSound('shoot');
    }
};

// Mejorar la función de explosión
const originalCreateExplosion = createExplosion;
createExplosion = function(x, y) {
    originalCreateExplosion(x, y);
    playSound('explosion');
};

// Mejorar la función de power-up
const originalActivatePowerUp = activatePowerUp;
activatePowerUp = function(type) {
    originalActivatePowerUp(type);
    playSound('powerup');
};

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadImages();
});
