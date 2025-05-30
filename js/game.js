// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 560;
canvas.height = 420;
ctx.imageSmoothingEnabled = false;
ctx.font = '16px "Press Start 2P"';
ctx.textAlign = 'left';

// Load background image
const bgImage = new Image();
bgImage.src = 'images/Map.png';

// Image loading
const enemyImages = [
  'players/Enemy1.png',
  'players/Enemy2.png',
  'players/Enemy3.png',
  'players/Enemy4.png'
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const playerImage = new Image();
playerImage.src = 'players/assault.png';

// Game state
let gameOver = false;
let score = 0;
let wave = 1;
let baseEnemies = 3; // Starting enemies per wave
let enemiesInWave = baseEnemies;
let enemiesDefeated = 0;
let waveComplete = false;
let waveTimer = 0;
let playerUpgrades = {
  damage: 1,
  health: 100,
  fireRate: 10
};
let showUpgrades = false;
let upgradeOptions = [];
const possibleUpgrades = [
  { type: 'damage', text: 'Increase Damage (+0.5x)' },
  { type: 'health', text: 'Increase Health (+20)' },
  { type: 'fireRate', text: 'Increase Fire Rate (-1 delay)' }
];

// Player
const player = {
  x: 50,
  y: 210,
  width: 30,
  height: 30,
  speed: 5,
  health: 100,
  image: playerImage,
  rotation: -Math.PI/2, // 90 degrees left
  bullets: []
};

// Enemies
const enemies = [];
const enemyBullets = [];
let enemySpawnTimer = 0;

// Controls
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

const buttons = {
  currentShoot: null,
  heldShoot: null,
  directions: {
    'ArrowRight': 0,         // Right
    'ArrowLeft': Math.PI,     // Left
    'ArrowUp': -Math.PI/2,    // Up (negative Y axis)
    'ArrowDown': Math.PI/2,   // Down (positive Y axis)
    // Combined directions
    'ArrowUp+ArrowRight': -Math.PI/4,     // Up-Right
    'ArrowUp+ArrowLeft': -3*Math.PI/4,    // Up-Left
    'ArrowDown+ArrowRight': Math.PI/4,    // Down-Right
    'ArrowDown+ArrowLeft': 3*Math.PI/4    // Down-Left
  },
  activeKeys: new Set() // Track currently pressed keys
};

const fireRates = {
  player: 10, // frames between shots
  playerTimer: 0,
  enemy: 120 // frames between shots
};

// Event listeners
document.addEventListener('keydown', (e) => {
  if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = true;
  }
  
  if (['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)) {
    buttons.activeKeys.add(e.key);
    
    // Check for combined directions
    if (buttons.activeKeys.has('ArrowUp') && buttons.activeKeys.has('ArrowRight')) {
      buttons.currentShoot = buttons.directions['ArrowUp+ArrowRight'];
    } else if (buttons.activeKeys.has('ArrowUp') && buttons.activeKeys.has('ArrowLeft')) {
      buttons.currentShoot = buttons.directions['ArrowUp+ArrowLeft'];
    } else if (buttons.activeKeys.has('ArrowDown') && buttons.activeKeys.has('ArrowRight')) {
      buttons.currentShoot = buttons.directions['ArrowDown+ArrowRight'];
    } else if (buttons.activeKeys.has('ArrowDown') && buttons.activeKeys.has('ArrowLeft')) {
      buttons.currentShoot = buttons.directions['ArrowDown+ArrowLeft'];
    } else if (buttons.activeKeys.has(e.key)) {
      buttons.currentShoot = buttons.directions[e.key];
    }
    
    buttons.heldShoot = buttons.currentShoot;
  }
});

document.addEventListener('keyup', (e) => {
  if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = false;
  }
  
  if (['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)) {
    buttons.activeKeys.delete(e.key);
    
    // Reset to remaining direction or stop shooting
    if (buttons.activeKeys.size === 0) {
      buttons.currentShoot = null;
      buttons.heldShoot = null;
    } else {
      // Get the first remaining key
      const remainingKey = buttons.activeKeys.values().next().value;
      buttons.currentShoot = buttons.directions[remainingKey];
      buttons.heldShoot = buttons.currentShoot;
    }
  }
});

canvas.addEventListener('click', (e) => {
  if (!showUpgrades && !gameOver) {
    if (gameOver || fireRates.playerTimer < fireRates.player) return;
  
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    // Determine shooting angle (right directions)
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    let shootingAngle;
  
    if (angle > Math.PI/6 && angle < 5*Math.PI/6) {
      shootingAngle = Math.PI/4; // Up-right
    } else if (angle < -Math.PI/6 && angle > -5*Math.PI/6) {
      shootingAngle = -Math.PI/4; // Down-right
    } else {
      shootingAngle = 0; // Straight right
    }
  
    createBullet(shootingAngle);
    fireRates.playerTimer = 0;
  }
}, { once: true });

canvas.addEventListener('click', (e) => {
  if (showUpgrades) {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Check which upgrade was clicked
    const upgradeY1 = canvas.height/2 - 50;
    const upgradeY2 = canvas.height/2 - 20;
    
    if (y >= upgradeY1 - 15 && y <= upgradeY1 + 15) {
      applyUpgrade(upgradeOptions[0].type);
      showUpgrades = false;
      startNextWave();
    } else if (y >= upgradeY2 - 15 && y <= upgradeY2 + 15) {
      applyUpgrade(upgradeOptions[1].type);
      showUpgrades = false;
      startNextWave();
    }
  }
});

// Game loop
function gameLoop() {
  if (gameOver) {
    drawGameOver();
    return;
  }
  
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Wave management
  if (enemies.length === 0) {
    if (!waveComplete && enemiesDefeated >= enemiesInWave) {
      waveComplete = true;
      wave++;
      enemiesInWave = baseEnemies + Math.floor(wave/3);
      
      // Every 3 waves, show upgrades
      if (wave % 3 === 0) {
        showUpgrades = true;
        upgradeOptions = [...possibleUpgrades]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2); // Show 2 random options
      } else {
        waveTimer = 180; // Normal 3 second delay
      }
    }
    
    if (waveComplete && !showUpgrades) {
      waveTimer--;
      if (waveTimer <= 0) {
        startNextWave();
      }
    }
  }

  // Handle button shooting
  fireRates.playerTimer++;
  if (buttons.currentShoot !== null && fireRates.playerTimer >= fireRates.player) {
    createBullet(buttons.currentShoot);
    fireRates.playerTimer = 0;
  }
  
  // Player movement
  if (keys.w && player.y > 0) player.y -= player.speed;
  if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
  if (keys.a && player.x > 0) player.x -= player.speed;
  if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;
  
  // Update player bullets
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    const bullet = player.bullets[i];
    bullet.x += bullet.speed * Math.cos(bullet.angle);
    bullet.y += bullet.speed * Math.sin(bullet.angle);
    
    // Remove bullets that go off screen
    if (bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      player.bullets.splice(i, 1);
      continue;
    }
    
    // Check bullet-enemy collisions
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (checkCollision(bullet, enemy)) {
        player.bullets.splice(i, 1);
        enemies.splice(j, 1);
        score += 10;
        enemiesDefeated++;
        break;
      }
    }
  }
  
  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.x += enemy.speed; // Should move left (negative speed)
    
    // Enemy shooting
    enemy.shootTimer++;
    if (enemy.shootTimer > fireRates.enemy) {
      enemyBullets.push({
        x: enemy.x, // Spawn from left side
        y: enemy.y + enemy.height/2,
        speed: 5, // Positive for right movement
        angle: Math.PI, // 180 degrees (left)
        width: 6, // Smaller width
        height: 3, // Smaller height
        color: 'orange'
      });
      enemy.shootTimer = 0;
    }
    
    // Check if enemy passed player
    if (enemy.x < 10) { // 10px damage zone
      player.health -= 10;
      enemies.splice(i, 1);
      if (player.health <= 0) gameOver = true;
    }
  }
  
  // Update enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.x += bullet.speed * Math.cos(bullet.angle);
    bullet.y += bullet.speed * Math.sin(bullet.angle);
    
    // Remove bullets that go off screen
    if (bullet.x < 0 || bullet.y < 0 || bullet.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }
    
    // Check bullet-player collision
    if (checkCollision(bullet, player)) {
      enemyBullets.splice(i, 1);
      player.health -= 20;
      if (player.health <= 0) gameOver = true;
    }
  }
}

function draw() {
  // Draw background
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  
  // Draw player
  ctx.save();
  ctx.translate(player.x + player.width/2, player.y + player.height/2);
  ctx.rotate(player.rotation);
  ctx.drawImage(player.image, -player.width/2, -player.height/2, player.width, player.height);
  ctx.restore();
  
  // Draw player health
  ctx.fillStyle = 'white';
  ctx.font = '16px "Press Start 2P"';
  ctx.fillText(`Health: ${player.health}`, 20, 25);
  ctx.fillText(`Score: ${score}`, 20, 45);
  ctx.fillText(`Wave: ${wave}`, 20, 65);

  
  // Draw player bullets
  ctx.fillStyle = 'white';
  player.bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.width/2, 0, Math.PI*2);
    ctx.fill();
  });
  
  // Draw enemies
  ctx.fillStyle = 'red';
  enemies.forEach(enemy => {
    ctx.save();
    ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
    ctx.rotate(enemy.rotation);
    ctx.drawImage(enemy.image, -enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
    ctx.restore();
  });
  
  // Draw enemy bullets
  ctx.fillStyle = 'orange';
  enemyBullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
  
  // Draw upgrade options
  if (showUpgrades) {
    ctx.fillStyle = 'white';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('Choose an upgrade:', canvas.width/2, canvas.height/2 - 100);
    for (let i = 0; i < upgradeOptions.length; i++) {
      ctx.fillText(upgradeOptions[i].text, canvas.width/2, canvas.height/2 - 50 + i * 30);
    }
  }
  
  // DEBUG: Only hitboxes remain
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  
  // Player hitbox
  ctx.strokeRect(player.x, player.y, player.width, player.height);
  
  // Enemy hitboxes
  enemies.forEach(enemy => {
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
  
  // Bullet hitboxes
  player.bullets.forEach(bullet => {
    ctx.strokeRect(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height);
  });
  
  enemyBullets.forEach(bullet => {
    ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Fixed damage zone (always at x < 10)
  ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
  ctx.fillRect(0, 0, 10, canvas.height);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ff3355';
  ctx.font = '30px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 50);
  
  ctx.fillStyle = 'white';
  ctx.font = '16px "Press Start 2P"';
  ctx.fillText(`FINAL SCORE: ${score}`, canvas.width/2, canvas.height/2 + 10);
  ctx.fillText(`WAVE: ${wave}`, canvas.width/2, canvas.height/2 + 30);
  
  ctx.fillStyle = '#55ff33';
  ctx.font = '20px "Press Start 2P"';
  ctx.fillText('CLICK TO RESTART', canvas.width/2, canvas.height/2 + 70);
  
  canvas.addEventListener('click', restartGame, { once: true });
}

function restartGame() {
  gameOver = false;
  player.health = 100;
  player.x = 50;
  player.y = 210;
  player.bullets = [];
  enemies.length = 0;
  enemyBullets.length = 0;
  score = 0;
  wave = 1;
  enemiesInWave = baseEnemies;
  enemiesDefeated = 0;
  waveComplete = false;
  waveTimer = 0;
  spawnWave();
  gameLoop();
}

function checkCollision(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

function createBullet(angle) {
  // Calculate spawn position based on angle
  let spawnX, spawnY;
  
  if (Math.abs(angle) <= Math.PI/4 || Math.abs(angle) >= 3*Math.PI/4) {
    // Mostly horizontal - spawn from side
    spawnX = angle > Math.PI/2 || angle < -Math.PI/2 ? player.x : player.x + player.width;
    spawnY = player.y + player.height/2;
  } else {
    // Mostly vertical - spawn from top/bottom
    spawnX = player.x + player.width/2;
    spawnY = angle > 0 ? player.y : player.y + player.height;
  }
  
  player.bullets.push({
    x: spawnX,
    y: spawnY,
    speed: 10,
    angle: angle,
    width: 6, // Smaller width
    height: 3, // Smaller height
    color: 'green'
  });
}

function spawnWave() {
  enemies.length = 0; // Clear any existing enemies
  for (let i = 0; i < enemiesInWave; i++) {
    setTimeout(() => {
      if (!gameOver) { // Only spawn if game isn't over
        enemies.push(createEnemy());
      }
    }, i * 500); // Stagger enemy spawns
  }
}

function createEnemy() {
  const enemyImage = enemyImages[Math.floor(Math.random() * enemyImages.length)];
  return {
    x: canvas.width - 30, // Spawn on right side
    y: Math.random() * (canvas.height - 30),
    width: 30,
    height: 30,
    speed: -0.4 - (Math.random() * 0.4 + wave * 0.04), // 5x slower
    health: 100 + (Math.floor(wave/3) * 5), // +5 health every 3 waves
    image: enemyImage,
    rotation: Math.PI/2, // 90 degrees right
    shootTimer: Math.floor(Math.random() * 100)
  };
}

function applyUpgrade(type) {
  switch(type) {
    case 'damage':
      playerUpgrades.damage += 0.5;
      break;
    case 'health':
      playerUpgrades.health += 20;
      player.health = Math.min(player.health + 20, playerUpgrades.health);
      break;
    case 'fireRate':
      playerUpgrades.fireRate = Math.max(5, playerUpgrades.fireRate - 1);
      fireRates.player = playerUpgrades.fireRate;
      break;
  }
}

function startNextWave() {
  waveComplete = false;
  enemiesDefeated = 0;
  spawnWave();
}

// Start the game
spawnWave();
gameLoop();