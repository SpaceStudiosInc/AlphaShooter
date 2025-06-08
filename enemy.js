class Enemy {
  constructor(x, y, moves, shoots, wave) {
    this.x = x;
    this.y = y;
    this.speedY = 0.2 + Math.floor((wave - 1) / 5) * 0.1;
    this.speedX = moves ? random([-0.2, 0.2]) + Math.floor((wave - 1) / 5) * 0.1 : 0;
    this.health = 10 + Math.floor((wave - 1) / 5) * 10;
    this.shoots = shoots;
    this.shootTimer = random(60, 120);
    this.sprite = random(enemySprites);
  }
  
  update() {
    this.y += this.speedY;
    if (this.shoots) {
      this.shootTimer--;
      if (this.shootTimer <= 0) {
        this.shoot();
        this.shootTimer = random(60, 120);
      }
    }
    if (this.speedX !== 0) {
      this.x += this.speedX;
      if (this.x < 25 || this.x > width / window.gameScale - 25) this.speedX *= -1;
    }
  }
  
  show() {
    image(this.sprite, this.x - 25, this.y - 25, 50, 50);
  }
  
  shoot() {
    projectiles.push(new Projectile(this.x, this.y + 25, 5, false, 5));
  }
  
  offscreen() {
    return this.y > height / window.gameScale;
  }
  
  hits(projectile) {
    let d = dist(this.x, this.y, projectile.x, projectile.y);
    return d < 25 + 5;
  }
}

class Projectile {
  constructor(x, y, speedY, isPlayer, damage, speedX = 0) {
    this.x = x;
    this.y = y;
    this.speedY = speedY;
    this.speedX = speedX;
    this.isPlayer = isPlayer;
    this.damage = damage;
  }
  
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
  }
  
  show() {
    fill(this.isPlayer ? 'white' : 'red');
    noStroke();
    if (this.isPlayer) {
      ellipse(this.x, this.y, 5, 5);
    } else {
      ellipse(this.x, this.y, 10, 20);
    }
  }
  
  offscreen() {
    return this.y < 0 || this.y > height / window.gameScale;
  }
}