export type GameState = {
  score: number;
  lives: number;
  wave: number;
  highScores?: number[];
  volume: number;
  difficulty: string;
  particles: boolean;
  muted: boolean;
  paused: boolean;
}

export type HUDProps = {
  state: {
    score: number;
    lives: number;
    wave: number;
  };
};

export type GameActions = {
  setVolume: (v: number) => void;
  setDifficulty: (d: string) => void;
  setParticles: (b: boolean) => void;
  toggleMute: () => void;
  getMuted: () => boolean;
  togglePause: () => void;
  restart: () => void;
  resetSettings: () => void;
}

export type SettingsPanelProps = {
  state: {
    volume: number;
    difficulty: string;
    particles: boolean;
    muted: boolean;
  };
  actions: {
    setVolume: (v: number) => void;
    setDifficulty: (d: string) => void;
    setParticles: (v: boolean) => void;
    resetSettings: () => void;
  };
  onClose: () => void;
};



export type InputState = {
  left: boolean;
  right: boolean;
  shoot: boolean;
};

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};
