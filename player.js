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
    this.moveLeft = false;
    this.moveRight = false;
    this.shooting = false;
    this.touchX = null;

    if (isMobile) {
      canvas.elt.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
      canvas.elt.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      canvas.elt.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    if (gameState === 'playing') {
      this.shooting = true;
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this.touchX || gameState !== 'playing') return;
    const touch = e.touches[0];
    const touchDiff = (touch.clientX - this.touchX) / window.gameScale;
    if (Math.abs(touchDiff) > 5) {
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
    this.shooting = false;
    this.touchX = null;
  }

  update() {
    const gameScale = window.gameScale || 1;
    const scaledWidth = width / gameScale;
    const scaledHeight = height / gameScale;
    const movementSpeed = this.speed * (1 + (1 - gameScale) * 0.5);

    if (keyIsDown(LEFT_ARROW)) this.x = max(30, this.x - movementSpeed);
    if (keyIsDown(RIGHT_ARROW)) this.x = min(scaledWidth - 30, this.x + movementSpeed);
    if (this.moveLeft) this.x = max(30, this.x - movementSpeed);
    if (this.moveRight) this.x = min(scaledWidth - 30, this.x + movementSpeed);

    this.x = constrain(this.x, 30, scaledWidth - 30);
    this.y = constrain(this.y, 0, scaledHeight - 50);

    if (this.shootTimer > 0) this.shootTimer--;

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
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage));
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage, -2));
      projectiles.push(new Projectile(this.x, this.y - 25, -this.bulletSpeed, true, this.damage, 2));
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