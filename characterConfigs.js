const characterConfigs = [
  {
    name: 'Trexed', // Shotgunner
    sprite: 'Sprites/Players/p1.png',
    speed: 5,
    fireRate: 15, // Slower fire rate for high-damage shots
    damage: 15, // High damage for shotgun style
    health: 100,
    bulletSpeed: 7.5,
    continuousShooting: false,
    triShot: true // Fires three bullets (straight + diagonal)
  },
  {
    name: 'The Bush', // Sniper
    sprite: 'Sprites/Players/p2.png',
    speed: 5,
    fireRate: 1, // Slow fire rate for precision
    damage: 20, // High damage per shot
    health: 90,
    bulletSpeed: 30, // Fast bullets
    continuousShooting: false,
    triShot: false
  },
  {
    name: 'Chancalorian', // Balanced
    sprite: 'Sprites/Players/p3.png',
    speed: 5,
    fireRate: 10, // Moderate fire rate
    damage: 10, // Moderate damage
    health: 100,
    bulletSpeed: 7.5,
    continuousShooting: true, // Can hold to shoot
    triShot: false
  },
  {
    name: 'Sandbag', // Tank
    sprite: 'Sprites/Players/p4.png',
    speed: 3, // Slow movement
    fireRate: 12,
    damage: 10,
    health: 120, // High health
    bulletSpeed: 6.25,
    continuousShooting: false,
    triShot: false
  },
  {
    name: 'Cowbell', // Pistol
    sprite: 'Sprites/Players/p5.png',
    speed: 5,
    fireRate: 8, // Faster fire rate
    damage: 8, // Moderate damage
    health: 90,
    bulletSpeed: 8,
    continuousShooting: true, // Can hold to shoot
    triShot: false
  },
  {
    name: 'Kazy', // Full-auto with debuff
    sprite: 'Sprites/Players/p6.png',
    speed: 6,
    fireRate: 5, // Very fast fire rate
    damage: 7, // Lower damage
    health: 80, // Debuff: lower health
    bulletSpeed: 7.5,
    continuousShooting: true, // Can hold to shoot
    triShot: true // Fires three bullets
  },
  {
    name: 'Speedsofter', // Fast-shooting, low damage
    sprite: 'Sprites/Players/p7.png',
    speed: 7, // Fast movement
    fireRate: 4, // Extremely fast fire rate
    damage: 1.0, // Low damage
    health: 85,
    bulletSpeed: 6,
    continuousShooting: true, // Can hold to shoot
    triShot: false
  }
];