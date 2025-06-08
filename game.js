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
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

let leftButton, rightButton, shootButton, selectButton;
let canvas;
let gameScale = 1;
let canvasWidth = 1000;
let canvasHeight = 800;

function preload() {
  textFont('Press Start 2P');
  try {
    bgImage = loadImage('images/map.png', () => console.log('Background loaded'), () => console.error('Failed to load background'));
    characters = characterConfigs.map(config => ({
      name: config.name,
      sprite: loadImage(config.sprite, () => console.log(`${config.name} sprite loaded`), () => console.error(`Failed to load ${config.name} sprite`)),
      speed: config.speed,
      fireRate: config.fireRate,
      damage: config.damage,
      health: config.health,
      bulletSpeed: config.bulletSpeed,
      continuousShooting: config.continuousShooting,
      triShot: config.triShot
    }));
    enemySprites = [
      loadImage('Sprites/Enemy/Enemy1.png', () => console.log('Enemy1 sprite loaded'), () => console.error('Failed to load Enemy1 sprite')),
      loadImage('Sprites/Enemy/Enemy2.png', () => console.log('Enemy2 sprite loaded'), () => console.error('Failed to load Enemy2 sprite'))
    ];
    bossSprites = {
      bodyHorizontal: loadImage('boss/body_horizontal.png', () => console.log('Boss body_horizontal loaded'), () => console.error('Failed to load boss body_horizontal')),
      bodyVertical: loadImage('boss/body_vertical.png', () => console.log('Boss body_vertical loaded'), () => console.error('Failed to load boss body_vertical')),
      turret: loadImage('boss/turret.png', () => console.log('Boss turret loaded'), () => console.error('Failed to load boss turret')),
      turretShoot: loadImage('boss/turret_shoot.png', () => console.log('Boss turret_shoot loaded'), () => console.error('Failed to load boss turret_shoot'))
    };
  } catch (e) {
    console.error('Error in preload:', e);
  }
}

function calculateCanvasSize() {
  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight - (isMobile ? 100 : 0);
  const scaleX = maxWidth / canvasWidth;
  const scaleY = maxHeight / canvasHeight;
  gameScale = min(scaleX, scaleY) * 0.95;
  window.gameScale = gameScale;
  resizeCanvas(canvasWidth * gameScale, canvasHeight * gameScale, false);
  if (canvas) {
    canvas.style('width', `${canvasWidth * gameScale}px`);
    canvas.style('height', `${canvasHeight * gameScale}px`);
    canvas.elt.style.position = 'absolute';
    canvas.elt.style.top = '0';
    canvas.elt.style.left = '0';
  }
}

function windowResized() {
  calculateCanvasSize();
}

function setup() {
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('game-container');
  calculateCanvasSize();

  if (isMobile) {
    leftButton = createButton('◀');
    rightButton = createButton('▶');
    selectButton = createButton('SELECT');
    shootButton = createButton('FIRE');
    
    const buttonStyle = {
      position: 'fixed',
      fontFamily: 'Press Start 2P',
      fontSize: '20px',
      padding: '15px 25px',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      border: '2px solid white',
      color: 'white',
      zIndex: 100,
      touchAction: 'manipulation',
      userSelect: 'none',
      webkitTapHighlightColor: 'transparent'
    };

    leftButton.style(buttonStyle);
    rightButton.style(buttonStyle);
    selectButton.style({
      ...buttonStyle,
      bottom: '100px',
      right: '20px',
      backgroundColor: 'rgba(50, 255, 50, 0.6)'
    });
    shootButton.style({
      ...buttonStyle,
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(255, 50, 50, 0.6)'
    });

    const updateButtonPositions = () => {
      const buttonBottom = window.innerHeight - 80;
      const buttonSpacing = 100;
      leftButton.position(20, buttonBottom);
      rightButton.position(20 + buttonSpacing, buttonBottom);
      selectButton.position(window.innerWidth - 150, buttonBottom + 80);
      shootButton.position(window.innerWidth - 150, buttonBottom);
    };

    updateButtonPositions();
    window.addEventListener('resize', updateButtonPositions);

    const handlePress = (button, action) => {
      button.mousePressed(action);
      button.elt.addEventListener('touchstart', (e) => {
        e.preventDefault();
        action();
      }, { passive: false });
    };

    const handleRelease = (button, action) => {
      button.mouseReleased(action);
      button.elt.addEventListener('touchend', (e) => {
        e.preventDefault();
        action();
      }, { passive: false });
      button.elt.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        action();
      }, { passive: false });
    };

    handlePress(leftButton, () => {
      if (gameState === 'menu') {
        selectedCharacter = (selectedCharacter - 1 + characters.length) % characters.length;
      } else if (gameState === 'playing') {
        player.moveLeft = true;
      }
    });
    handleRelease(leftButton, () => {
      if (gameState === 'playing') player.moveLeft = false;
    });
    handlePress(rightButton, () => {
      if (gameState === 'menu') {
        selectedCharacter = (selectedCharacter + 1) % characters.length;
      } else if (gameState === 'playing') {
        player.moveRight = true;
      }
    });
    handleRelease(rightButton, () => {
      if (gameState === 'playing') player.moveRight = false;
    });
    handlePress(selectButton, () => {
      if (gameState === 'menu') {
        startGame();
      } else if (gameState === 'gameOver') {
        resetGame();
      }
    });
    handlePress(shootButton, () => {
      if (gameState === 'playing') player.shooting = true;
    });
    handleRelease(shootButton, () => {
      if (gameState === 'playing') player.shooting = false;
    });

    const addTouchFeedback = (button, activeColor) => {
      button.elt.addEventListener('touchstart', () => {
        button.style('background-color', activeColor);
      });
      button.elt.addEventListener('touchend', () => {
        button.style('background-color', button === shootButton ? 'rgba(255, 50, 50, 0.6)' : button === selectButton ? 'rgba(50, 255, 50, 0.6)' : 'rgba(255, 255, 255, 0.3)');
      });
    };

    addTouchFeedback(leftButton, 'rgba(255, 255, 255, 0.5)');
    addTouchFeedback(rightButton, 'rgba(255, 255, 255, 0.5)');
    addTouchFeedback(selectButton, 'rgba(50, 255, 50, 0.8)');
    addTouchFeedback(shootButton, 'rgba(255, 50, 50, 0.8)');

    document.addEventListener('touchmove', (e) => {
      if ([leftButton.elt, rightButton.elt, selectButton.elt, shootButton.elt].includes(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });

    selectButton.show();
    leftButton.show();
    rightButton.show();
    shootButton.hide();
  }
}

function startGame() {
  player = new Player(characters[selectedCharacter]);
  if (isMobile) {
    leftButton.show();
    rightButton.show();
    shootButton.show();
    selectButton.hide();
  }
  spawnWave();
  gameState = 'playing';
}

function draw() {
  background(0);
  push();
  scale(gameScale);
  if (gameState === 'menu') {
    drawMenu();
  } else if (gameState === 'playing') {
    drawGame();
  } else if (gameState === 'gameOver') {
    drawGameOver();
  }
  pop();
  displayHUD();
}

function drawMenu() {
  fill(255);
  textAlign(CENTER);
  textSize(24 / gameScale);
  text('Select Your Ship', width / (2 * gameScale), 80 / gameScale);
  textSize(12 / gameScale);
  text(isMobile ? 'Use ◄/► to choose, SELECT to start' : 'Use LEFT/RIGHT to choose, ENTER to start', width / (2 * gameScale), height / gameScale - 30 / gameScale);
  
  let spacing = width / (characters.length + 1) / gameScale;
  for (let i = 0; i < characters.length; i++) {
    let x = spacing * (i + 1);
    let y = height / (2 * gameScale);
    textSize(12 / gameScale);
    fill(0);
    text(characters[i].name, x + 2 / gameScale, y - 35 / gameScale + 2 / gameScale);
    fill(255);
    text(characters[i].name, x, y - 35 / gameScale);
    image(characters[i].sprite, x - 25 / gameScale, y - 25 / gameScale, 50 / gameScale, 50 / gameScale);
    textSize(8 / gameScale);
    textAlign(LEFT);
    let statXLeft = x - 40 / gameScale;
    let statXRight = x + 10 / gameScale;
    let statY = y + 50 / gameScale;
    fill(0);
    text('SPD', statXLeft + 2 / gameScale, statY + 2 / gameScale);
    text(getDots(characters[i].speed, 3, 7), statXRight + 2 / gameScale, statY + 2 / gameScale);
    fill(255);
    text('SPD', statXLeft, statY);
    text(getDots(characters[i].speed, 3, 7), statXRight, statY);
    fill(0);
    text('FIR', statXLeft + 2 / gameScale, statY + 12 / gameScale + 2 / gameScale);
    text(getDots(15 - characters[i].fireRate, 0, 11), statXRight + 2 / gameScale, statY + 12 / gameScale + 2 / gameScale);
    fill(255);
    text('FIR', statXLeft, statY + 12 / gameScale);
    text(getDots(15 - characters[i].fireRate, 0, 11), statXRight, statY + 12 / gameScale);
    fill(0);
    text('DMG', statXLeft + 2 / gameScale, statY + 24 / gameScale + 2 / gameScale);
    text(getDots(characters[i].damage, 5, 20), statXRight + 2 / gameScale, statY + 24 / gameScale + 2 / gameScale);
    fill(255);
    text('DMG', statXLeft, statY + 24 / gameScale);
    text(getDots(characters[i].damage, 5, 20), statXRight, statY + 24 / gameScale);
    fill(0);
    text('HP', statXLeft + 2 / gameScale, statY + 36 / gameScale + 2 / gameScale);
    text(getDots(characters[i].health, 80, 120), statXRight + 2 / gameScale, statY + 36 / gameScale + 2 / gameScale);
    fill(255);
    text('HP', statXLeft, statY + 36 / gameScale);
    text(getDots(characters[i].health, 80, 120), statXRight, statY + 36 / gameScale);
    fill(0);
    text('BLT', statXLeft + 2 / gameScale, statY + 48 / gameScale + 2 / gameScale);
    text(getDots(characters[i].bulletSpeed, 5, 10), statXRight + 2 / gameScale, statY + 48 / gameScale + 2 / gameScale);
    fill(255);
    text('BLT', statXLeft, statY + 48 / gameScale);
    text(getDots(characters[i].bulletSpeed, 5, 10), statXRight, statY + 48 / gameScale);
    if (i === selectedCharacter) {
      stroke(255);
      noFill();
      rect(x - 30 / gameScale, y - 30 / gameScale, 60 / gameScale, 70 / gameScale);
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
  const scaledWidth = width / gameScale;
  const scaledHeight = height / gameScale;
  image(bgImage, 0, 0, scaledWidth, scaledHeight);
  
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
}

function drawGameOver() {
  fill(255);
  textAlign(CENTER);
  textSize(32 / gameScale);
  text('Game Over', width / (2 * gameScale), height / (2 * gameScale));
  textSize(16 / gameScale);
  text(`Wave: ${wave}`, width / (2 * gameScale), height / (2 * gameScale) + 40 / gameScale);
  text('Press R to Restart or SELECT on mobile', width / (2 * gameScale), height / (2 * gameScale) + 80 / gameScale);
  document.getElementById('game-over').style.display = 'block';
  document.getElementById('wave').textContent = wave;
  if (isMobile) {
    leftButton.hide();
    rightButton.hide();
    shootButton.hide();
    selectButton.show();
    selectButton.elt.textContent = 'RESTART';
  }
}

function displayHUD() {
  fill(255);
  textAlign(LEFT);
  textSize(16 / gameScale);
  text(`Wave: ${wave}`, 10 / gameScale, 30 / gameScale);
  text(`Score: ${score}`, 10 / gameScale, 60 / gameScale);
  text(`Health: ${player.health}`, 10 / gameScale, 90 / gameScale);
}

function keyPressed() {
  if (gameState === 'menu') {
    if (keyCode === LEFT_ARROW) {
      selectedCharacter = (selectedCharacter - 1 + characters.length) % characters.length;
    } else if (keyCode === RIGHT_ARROW) {
      selectedCharacter = (selectedCharacter + 1) % characters.length;
    } else if (keyCode === ENTER) {
      startGame();
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
    let x = random(50, width / gameScale - 50);
    let y = -50;
    let moves = random() > 0.5;
    let shoots = random() > 0.7;
    enemies.push(new Enemy(x, y, moves, shoots, wave));
  }
}

function spawnBoss() {
  boss = new Boss(width / (2 * gameScale), -50, wave);
}

function spawnUpgrades(isBossWave) {
  let upgradeCount = isBossWave ? 3 : 1;
  for (let i = 0; i < upgradeCount; i++) {
    let x = random(50, width / gameScale - 50);
    let y = random(50, height / gameScale - 50);
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
  if (isMobile) {
    leftButton.show();
    rightButton.show();
    shootButton.show();
    selectButton.hide();
    selectButton.elt.textContent = 'SELECT';
  }
  spawnWave();
}