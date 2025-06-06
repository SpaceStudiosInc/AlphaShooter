class Player {
  constructor(config) {
    this.x = width / 2;
    this.y = height - 50;
    this.speed = config.speed;
    this.health = config.health;
    this.fireRate = config.fireRate;
    this.damage = config.damage;
    this.bulletSpeed = config.bulletSpeed;
    this.continuousShooting = config.continuousShooting;
    this.triShot = config.triShot;
    this.shootTimer = 0;
    this.sprite = config.sprite;
    
    // Mobile controls state
    this.moveLeft = false;
    this.moveRight = false;
    this.shooting = false;
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchX = touch.clientX;
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    if (!this.touchX) return;
    
    const touch = e.touches[0];
    const touchDiff = touch.clientX - this.touchX;
    
    if (Math.abs(touchDiff) > 5) { // Deadzone to prevent jitter
      if (touchDiff > 0) {
        this.moveRight = true;
        this.moveLeft = false;
      } else {
        this.moveLeft = true;
        this.moveRight = false;
      }
      this.touchX = touch.clientX;
    }
  }
  
  handleTouchEnd(e) {
    e.preventDefault();
    this.moveLeft = false;
    this.moveRight = false;
    this.touchX = null;
  }
  
  update() {
    // Get the game scale from the global scope
    const gameScale = window.gameScale || 1;
    const scaledWidth = width / gameScale;
    const scaledHeight = height / gameScale;
    
    // Movement - adjust speed based on scale
    const movementSpeed = this.speed * (1 + (1 - gameScale) * 0.5); // Adjust speed based on scale
    
    // Handle keyboard controls
    if (keyIsDown(LEFT_ARROW)) this.x = max(30, this.x - movementSpeed);
    if (keyIsDown(RIGHT_ARROW)) this.x = min(scaledWidth - 30, this.x + movementSpeed);
    
    // Handle touch controls
    if (this.moveLeft) this.x = max(30, this.x - movementSpeed);
    if (this.moveRight) this.x = min(scaledWidth - 30, this.x + movementSpeed);
    
    // Keep player within bounds after scaling
    this.x = constrain(this.x, 30, scaledWidth - 30);
    this.y = constrain(this.y, 0, scaledHeight - 50);
    
    if (this.shootTimer > 0) this.shootTimer--;
    
    // Handle shooting from both keyboard and touch
    const shouldShoot = (this.continuousShooting && (keyIsDown(32) || this.shooting)) || 
                       (this.shooting && this.shootTimer === 0);
    
    if (shouldShoot && this.shootTimer === 0) {
      this.shoot();
    }
  }
  
  show() {
    image(this.sprite, this.x - 25, this.y - 25, 50, 50);
  }
  
  shoot() {
    if (this.triShot) {
      // Straight shot
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage));
      // Diagonal shots (left and right)
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage, -2)); // Left diagonal
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage, 2)); // Right diagonal
    } else {
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage));
    }
    this.shootTimer = this.fireRate;
  }
  
  hits(obj) {
    let d = dist(this.x, this.y, obj.x, obj.y);
    return d < 25 + (obj.size || 10);
  }
}