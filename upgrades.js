class Upgrade {
  constructor(x, y, isMajor) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.type = random(['fireRate', 'damage', 'speed', 'health']);
    this.value = isMajor ? 2 : 1;
  }
  
  update() {}
  
  show() {
    fill(this.getColor());
    noStroke();
    rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    fill(255);
    textAlign(CENTER);
    textSize(12);
    text(this.type.charAt(0).toUpperCase(), this.x, this.y + 4);
  }
  
  getColor() {
    switch (this.type) {
      case 'fireRate': return 'blue';
      case 'damage': return 'red';
      case 'speed': return 'green';
      case 'health': return 'yellow';
      default: return 'white';
    }
  }
  
  apply(player) {
    switch (this.type) {
      case 'fireRate':
        player.fireRate = max(5, player.fireRate - this.value);
        break;
      case 'damage':
        player.damage += this.value * 5;
        break;
      case 'speed':
        player.speed += this.value;
        break;
      case 'health':
        player.health = min(100, player.health + this.value * 20);
        break;
    }
  }
  
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + 25;
  }
}