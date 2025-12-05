export type GameActions = {
  startGame: () => void;
  setVolume: (v: number) => void;
  setDifficulty: (d: string) => void;
  setParticles: (b: boolean) => void;
  resetSettings: () => void;
  togglePause: () => void;
  restart: () => void;
  toggleMute: () => void;
  getMuted: () => boolean;
  toggleMusic: () => void;
  getMusicMuted: () => boolean;
};

export type GameState = {
  volume: number;
  difficulty: string;
  particles: boolean;
  muted: boolean;
  score: number;
  lives: number;
  wave: number;
  paused: boolean;
  gameOver: boolean;
  gameStarted: boolean;
  highScores: number[];
};
