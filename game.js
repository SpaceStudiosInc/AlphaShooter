let player;
let enemies = [];
let projectiles = [];
let boss = null;
let upgrades = [];
let wave = 1;
let gameOver = false;
let score = 0;
let gameState = 'menu';
let characters = [];
let selectedCharacter = 0;
let bgImage;

function preload() {
  bgImage = loadImage('images/map.png');
  characters = characterConfigs.map(config => ({
    name: config.name,
    sprite: loadImage(config.sprite),
    speed: config.speed,
    fireRate: config.fireRate,
    damage: config.damage,
    health: config.health,
    bulletSpeed: config.bulletSpeed,
    continuousShooting: config.continuousShooting,
    triShot: config.triShot
  }));
  enemySprites = [
    loadImage('Sprites/Enemy/Enemy1.png'),
    loadImage('Sprites/Enemy/Enemy2.png')
  ];
  bossSprites = {
    bodyHorizontal: loadImage('boss/body_horizontal.png'),
    bodyVertical: loadImage('boss/body_vertical.png'),
    turret: loadImage('boss/turret.png'),
    turretShoot: loadImage('boss/turret_shoot.png')
  };
}

let leftButton, rightButton, shootButton;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function setup() {
  createCanvas(800, 600);
  textFont('Press Start 2P');
  
  if (isMobile) {
    // Create control buttons
    leftButton = createButton('◀');
    rightButton = createButton('▶');
    shootButton = createButton('FIRE');
    
    // Style buttons
    const buttonStyle = {
      position: 'absolute',
      width: '80px',
      height: '80px',
      fontSize: '24px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      border: '2px solid white',
      color: 'white',
      borderRadius: '50%',
      userSelect: 'none'
    };
    
    Object.assign(leftButton.elt.style, buttonStyle, { bottom: '20px', left: '20px' });
    Object.assign(rightButton.elt.style, buttonStyle, { bottom: '20px', left: '120px' });
    Object.assign(shootButton.elt.style, {
      ...buttonStyle,
      width: '120px',
      borderRadius: '40px',
      bottom: '20px',
      right: '20px',
      fontSize: '20px'
    });
    
    // Touch event listeners
    leftButton.mousePressed(() => player.moveLeft = true);
    leftButton.mouseReleased(() => player.moveLeft = false);
    leftButton.touchStart(() => { player.moveLeft = true; return false; });
    leftButton.touchEnd(() => { player.moveLeft = false; return false; });
    
    rightButton.mousePressed(() => player.moveRight = true);
    rightButton.mouseReleased(() => player.moveRight = false);
    rightButton.touchStart(() => { player.moveRight = true; return false; });
    rightButton.touchEnd(() => { player.moveRight = false; return false; });
    
    shootButton.mousePressed(() => player.shooting = true);
    shootButton.mouseReleased(() => player.shooting = false);
    shootButton.touchStart(() => { player.shooting = true; return false; });
    shootButton.touchEnd(() => { player.shooting = false; return false; });
    
    // Hide buttons initially, they'll be shown when game starts
    leftButton.hide();
    rightButton.hide();
    shootButton.hide();
  }
}

function draw() {
  background(0);
  
  if (gameState === 'menu') {
    drawMenu();
  } else if (gameState === 'playing') {
    drawGame();
  } else if (gameState === 'gameOver') {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-wave').textContent = wave - 1;
  }
}

function drawMenu() {
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text('Select Your Ship', width / 2, 80);
  textSize(12);
  text('Use LEFT/RIGHT to choose, ENTER to start', width / 2, height - 30);
  
  let spacing = width / (characters.length + 1);
  for (let i = 0; i < characters.length; i++) {
    let x = spacing * (i + 1);
    let y = height / 2;
    textSize(12);
    fill(0);
    text(characters[i].name, x + 2, y - 35 + 2);
    fill(255);
    text(characters[i].name, x, y - 35);
    image(characters[i].sprite, x - 25, y - 25, 50, 50);
    textSize(8);
    textAlign(LEFT);
    let statXLeft = x - 40;
    let statXRight = x + 10;
    let statY = y + 50;
    fill(0);
    text('SPD', statXLeft + 2, statY + 2);
    text(getDots(characters[i].speed, 3, 7), statXRight + 2, statY + 2);
    fill(255);
    text('SPD', statXLeft, statY);
    text(getDots(characters[i].speed, 3, 7), statXRight, statY);
    fill(0);
    text('FIR', statXLeft + 2, statY + 12 + 2);
    text(getDots(15 - characters[i].fireRate, 0, 11), statXRight + 2, statY + 12 + 2); // Adjusted for new fireRate range
    fill(255);
    text('FIR', statXLeft, statY + 12);
    text(getDots(15 - characters[i].fireRate, 0, 11), statXRight, statY + 12);
    fill(0);
    text('DMG', statXLeft + 2, statY + 24 + 2);
    text(getDots(characters[i].damage, 5, 20), statXRight + 2, statY + 24 + 2); // Adjusted for new damage range
    fill(255);
    text('DMG', statXLeft, statY + 24);
    text(getDots(characters[i].damage, 5, 20), statXRight, statY + 24);
    fill(0);
    text('HP', statXLeft + 2, statY + 36 + 2);
    text(getDots(characters[i].health, 80, 120), statXRight + 2, statY + 36 + 2);
    fill(255);
    text('HP', statXLeft, statY + 36);
    text(getDots(characters[i].health, 80, 120), statXRight, statY + 36);
    fill(0);
    text('BLT', statXLeft + 2, statY + 48 + 2);
    text(getDots(characters[i].bulletSpeed, 5, 10), statXRight + 2, statY + 48 + 2);
    fill(255);
    text('BLT', statXLeft, statY + 48);
    text(getDots(characters[i].bulletSpeed, 5, 10), statXRight, statY + 48);
    if (i === selectedCharacter) {
      stroke(255);
      noFill();
      rect(x - 30, y - 30, 60, 70);
      noStroke();
    }
  }
  textAlign(CENTER);
}

function getDots(value, min, max) {
  let dots = Math.floor((value - min) / (max - min) * 5);
  dots = constrain(dots, 0, 5);
  return '●'.repeat(dots) + '○'.repeat(5 - dots);
}

function drawGame() {
  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  }
  
  player.update();
  player.show();
  
  if (boss) {
    boss.update();
    boss.show();
  } else {
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].update();
      enemies[i].show();
      if (enemies[i].offscreen() || enemies[i].health <= 0) {
        if (enemies[i].health <= 0) score += 10;
        enemies.splice(i, 1);
      }
    }
  }
  
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].show();
    if (projectiles[i].offscreen()) {
      projectiles.splice(i, 1);
    } else {
      handleCollisions(projectiles[i], i);
    }
  }
  
  for (let i = upgrades.length - 1; i >= 0; i--) {
    upgrades[i].update();
    upgrades[i].show();
    if (upgrades[i].hits(player)) {
      upgrades[i].apply(player);
      upgrades.splice(i, 1);
    }
  }
  
  if (enemies.length === 0 && !boss) {
    wave++;
    if (wave % 10 === 0) {
      spawnBoss();
      if (wave % 5 === 0) spawnUpgrades(true);
    } else {
      spawnWave();
      if (wave % 5 === 0) spawnUpgrades(false);
    }
  }
  
  textSize(16);
  displayHUD();
}

function displayHUD() {
  fill(255);
  textAlign(LEFT);
  text(`Wave: ${wave}`, 10, 30);
  text(`Score: ${score}`, 10, 60);
  text(`Health: ${player.health}`, 10, 90);
}

function keyPressed() {
  if (gameState === 'menu') {
    if (keyCode === LEFT_ARROW) {
      selectedCharacter = (selectedCharacter - 1 + characters.length) % characters.length;
    } else if (keyCode === RIGHT_ARROW) {
      selectedCharacter = (selectedCharacter + 1) % characters.length;
    } else if (keyCode === ENTER) {
      player = new Player(characters[selectedCharacter]);
      if (isMobile) {
        leftButton.show();
        rightButton.show();
        shootButton.show();
      }
      spawnWave();
      gameState = 'playing';
    }
  } else if (gameState === 'playing') {
    if (keyCode === 32 && !player.continuousShooting) {
      player.shoot();
    }
  } else if (gameState === 'gameOver' && key === 'r') {
    resetGame();
  }
}

function spawnWave() {
  let enemyCount = 5 + wave * 2;
  for (let i = 0; i < enemyCount; i++) {
    let x = random(50, width - 50);
    let y = -50;
    let moves = random() > 0.5;
    let shoots = random() > 0.7;
    enemies.push(new Enemy(x, y, moves, shoots, wave));
  }
}

function spawnBoss() {
  boss = new Boss(width / 2, -50, wave);
}

function spawnUpgrades(isBossWave) {
  let upgradeCount = isBossWave ? 3 : 1;
  for (let i = 0; i < upgradeCount; i++) {
    let x = random(50, width - 50);
    let y = random(50, height - 50);
    upgrades.push(new Upgrade(x, y, isBossWave));
  }
}

function handleCollisions(projectile, index) {
  if (projectile.isPlayer && boss) {
    if (boss.hits(projectile)) {
      boss.health -= projectile.damage;
      projectiles.splice(index, 1);
      if (boss.health <= 0) {
        score += 100;
        boss = null;
      }
    }
  } else if (projectile.isPlayer) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].hits(projectile)) {
        enemies[i].health -= projectile.damage;
        projectiles.splice(index, 1);
        break;
      }
    }
  } else {
    if (player.hits(projectile)) {
      player.health -= projectile.damage;
      projectiles.splice(index, 1);
      if (player.health <= 0) {
        gameState = 'gameOver';
      }
    }
  }
}

function resetGame() {
  player = new Player(characters[selectedCharacter]);
  enemies = [];
  projectiles = [];
  boss = null;
  upgrades = [];
  wave = 1;
  score = 0;
  gameState = 'playing';
  document.getElementById('game-over').style.display = 'none';
  spawnWave();
}