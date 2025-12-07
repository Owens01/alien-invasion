export type Player = {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
};

export type Bullet = {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  isBig?: boolean;
};

export type Enemy = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  shootTimer: number;
  creatureType: number;
  health: number;
  maxHealth: number;
  isBig: boolean;
  healthDisplayTimer: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color?: string;
};

export type Settings = {
  volume: number;
  difficulty: string;
  particles: boolean;
  muted: boolean;
};

export type Stats = {
  score: number;
  lives: number;
  wave: number;
  highScores: number[];
  highScore: number;
};

export type InternalGameState = {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  enemyBullets: Bullet[];
  particles: Particle[];
  initialWaveSpawned: boolean;
  paused: boolean;
  gameStarted: boolean;
  gameOver: boolean;

  // ⭐ Add this
  gameOverTimer?: number;

  scaleFactor: number;
  lastShoot: boolean;
  shake: number;
  activeCreatureType: number;
};

