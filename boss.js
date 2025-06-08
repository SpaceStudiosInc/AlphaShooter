class Boss {
  constructor(x, y, wave) {
    this.x = x;
    this.y = y;
    this.health = 200 + wave * 50;
    this.speed = 1 + wave * 0.05;
    this.direction = 1;
    this.timer = 0;
    this.shootTimer = 60;
    this.bodySprite = bossSprites.bodyHorizontal;
  }
  
  update() {
    this.timer++;
    this.y += this.speed;
    this.x += this.direction * this.speed;
    
    if (this.timer % 60 === 0) {
      this.direction *= -1;
      this.bodySprite = this.direction > 0 ? bossSprites.bodyHorizontal : bossSprites.bodyVertical;
    }
    
    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shoot();
      this.shootTimer = 60;
    }
    
    this.x = constrain(this.x, 50, width / window.gameScale - 50);
  }
  
  show() {
    image(this.bodySprite, this.x - 50, this.y - 50, 100, 100);
    let turretSprite = this.shootTimer < 10 ? bossSprites.turretShoot : bossSprites.turret;
    image(turretSprite, this.x - 25, this.y - 75, 50, 50);
  }
  
  shoot() {
    projectiles.push(new Projectile(this.x, this.y, 5, false, 10));
  }
  
  hits(projectile) {
    let d = dist(this.x, this.y, projectile.x, projectile.y);
    return d < 50 + 10;
  }
}