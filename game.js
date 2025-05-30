// Game Constants
const GAME_WIDTH = 777;
const GAME_HEIGHT = 550;

// Game State
let gameRunning = false;
let currentWave = 1;
let score = 0;
let player = null;
let enemies = [];
let bullets = [];

// Key bindings setup
const keys = {
    // Movement (WASD)
    'w': false,
    'a': false,
    's': false,
    'd': false,
    
    // Shooting (Arrow keys)
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false
};

// Key event handlers
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Image cache
const imageCache = {};

// Preload images
function preloadImages() {
    const imagesToLoad = [
        './images/map.png',
        './players/p1.png',
        './players/p2.png',
        './players/p3.png',
        './players/p4.png',
        './players/p5.png',
        './players/p6.png',
        './players/Enemy1.png',
        './players/Enemy2.png'
    ];
    
    return Promise.all(imagesToLoad.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                imageCache[src] = img;
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                resolve();
            };
            img.src = src;
        });
    }));
}

// Initialize Game
function initGame() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    document.getElementById('gameScreen').style.display = 'none';
}

// Start Game
function startGame(character) {
    // Hide other screens
    document.getElementById('selectScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Show game screen
    document.getElementById('gameScreen').style.display = 'flex';
    
    // Player initialization
    player = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 100,
        width: 40,
        height: 40,
        speed: character.stats.speed,
        health: character.stats.health,
        currentHealth: character.stats.health,
        fireRate: character.stats.fireRate,
        damage: character.stats.damage,
        sprite: character.sprite,
        lastShot: 0
    };
    
    // Reset game state
    score = 0;
    currentWave = 1;
    enemies = [];
    bullets = [];
    gameRunning = true;
    
    // Start game loop
    spawnWave();
    gameLoop();
}

// Player Classes
const PLAYER_CLASSES = {
    scout: { speed: 5, health: 100, fireRate: 0.2, damage: 20, color: '#3498db', sprite: './players/p1.png' },
    balanced: { speed: 3.5, health: 150, fireRate: 0.3, damage: 25, color: '#2ecc71', sprite: './players/p2.png' },
    tank: { speed: 2.5, health: 200, fireRate: 0.5, damage: 30, color: '#e74c3c', sprite: './players/p3.png' }
};

// Enemy sprites
const ENEMY_SPRITES = ['./players/Enemy1.png', './players/Enemy2.png'];

// Spawn Wave
function spawnWave() {
    const baseEnemies = 5;
    const additionalEnemies = Math.floor(currentWave / 3);
    const totalEnemies = baseEnemies + additionalEnemies;
    
    for (let i = 0; i < totalEnemies; i++) {
        enemies.push({
            x: Math.random() * (GAME_WIDTH - 40) + 20,
            y: -40,
            width: 40,
            height: 40,
            speed: 1 + (currentWave * 0.1),
            health: 5 + (currentWave * 2),
            sprite: ENEMY_SPRITES[Math.floor(Math.random() * ENEMY_SPRITES.length)]
        });
    }
}

// Update player movement
function updatePlayer() {
    if (!player) return;
    
    // WASD Movement
    let moveX = 0, moveY = 0;
    if (keys['a']) moveX = -player.speed;
    if (keys['d']) moveX = player.speed;
    if (keys['w']) moveY = -player.speed;
    if (keys['s']) moveY = player.speed;
    
    // Diagonal movement normalization
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
    }
    
    player.x = Math.max(20, Math.min(GAME_WIDTH - 20, player.x + moveX));
    player.y = Math.max(20, Math.min(GAME_HEIGHT - 20, player.y + moveY));
    
    // 8-directional shooting
    const now = Date.now();
    if (keys['ArrowUp'] && now - player.lastShot > player.fireRate * 1000) {
        bullets.push({
            x: player.x,
            y: player.y,
            velX: 0,
            velY: -10
        });
        player.lastShot = now;
    }
    if (keys['ArrowDown'] && now - player.lastShot > player.fireRate * 1000) {
        bullets.push({
            x: player.x,
            y: player.y,
            velX: 0,
            velY: 10
        });
        player.lastShot = now;
    }
    if (keys['ArrowLeft'] && now - player.lastShot > player.fireRate * 1000) {
        bullets.push({
            x: player.x,
            y: player.y,
            velX: -10,
            velY: 0
        });
        player.lastShot = now;
    }
    if (keys['ArrowRight'] && now - player.lastShot > player.fireRate * 1000) {
        bullets.push({
            x: player.x,
            y: player.y,
            velX: 10,
            velY: 0
        });
        player.lastShot = now;
    }
}

// Update enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Move down
        enemy.y += enemy.speed;
        
        // Remove if past bottom
        if (enemy.y > canvas.height + enemy.height) {
            enemies.splice(index, 1);
        }
    });
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.velX;
        bullet.y += bullet.velY;
        
        // Remove if off-screen
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

// Check for collisions
function checkCollisions() {
    // Player bullet hits enemy
    bullets.forEach((bullet, i) => {
        enemies.forEach((enemy, j) => {
            if (Math.abs(bullet.x - enemy.x) < 20 && 
                Math.abs(bullet.y - enemy.y) < 20) {
                enemy.health -= bullet.damage;
                bullets.splice(i, 1);
                
                if (enemy.health <= 0) {
                    enemies.splice(j, 1);
                    score += 100;
                }
            }
        });
    });
    
    // Enemy hits player
    enemies.forEach((enemy, enemyIndex) => {
        // Enemy-player collision
        if (checkCollision(player, enemy)) {
            player.currentHealth -= 10;
            enemies.splice(enemyIndex, 1);
            
            // Check if player died
            if (player.currentHealth <= 0) {
                showGameOver();
                return;
            }
        }
    });
}

// Drawing functions
function drawPlayer() {
    if (!player?.sprite) return;
    const img = imageCache[player.sprite];
    if (img) {
        ctx.save();
        ctx.translate(player.x, player.y + player.height/2);
        ctx.scale(1, -1);
        ctx.drawImage(img, -player.width/2, 0, player.width, player.height);
        ctx.restore();
    } else {
        // Fallback rendering
        ctx.fillStyle = '#3498db';
        ctx.fillRect(player.x - player.width/2, player.y - player.height/2, player.width, player.height);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy?.sprite) return;
        const img = imageCache[enemy.sprite];
        if (img) {
            ctx.drawImage(img, enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
        } else {
            // Fallback rendering
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
        }
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    });
}

function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '20px "VCR OSD Mono"';
    ctx.fillText(`Wave: ${currentWave}`, 20, 30);
    ctx.fillText(`Health: ${player.currentHealth}/${player.health}`, 20, 60);
}

// Main Game Loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear Canvas with background
    const bg = imageCache['./images/map.png'];
    if (bg) {
        ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
        // Fallback to solid color
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    
    // Draw game elements
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawUI();
    
    // Update game state
    updatePlayer();
    updateEnemies();
    updateBullets();
    checkCollisions();
    
    // Check Wave Completion
    if (enemies.length === 0) {
        currentWave++;
        if (currentWave % 3 === 0) {
            // Every 3 waves, increase difficulty
            PLAYER_CLASSES.scout.health += 5;
            PLAYER_CLASSES.balanced.health += 5;
            PLAYER_CLASSES.tank.health += 5;
        }
        spawnWave();
    }

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Game Over Screen
function showGameOver() {
    gameRunning = false;
    
    // Safely update score display
    const finalScoreEl = document.getElementById('finalScore');
    const finalWaveEl = document.getElementById('finalWave');
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (finalWaveEl) finalWaveEl.textContent = currentWave;
    
    // Show game over screen
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Initialize on load
window.onload = async function() {
    await preloadImages();
    initGame();
};
window.startGame = startGame;

// Helper function for collision detection
function checkCollision(obj1, obj2) {
    return Math.abs(obj1.x - obj2.x) < (obj1.width + obj2.width) / 2 &&
           Math.abs(obj1.y - obj2.y) < (obj1.height + obj2.height) / 2;
}
