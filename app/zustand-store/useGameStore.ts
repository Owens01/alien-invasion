"use client";

import { create } from "zustand"; // New import for Zustand
import { RefObject } from "react"; // Only RefObject is needed now
import useInput from "../"; // Keeping external dependency
import usePersistentState from "./usePersistentState";
import config from "../data/config";
import { clamp } from "../utils/clamp";
import { detectCollisions } from "../utils/collisions";
import {
  playSound,
  playMusic,
  fadeOutMusic,
  resumeMusic,
  toggleMusic,
  getMusicMuted,
} from "../utils/audio";

// --- TYPES (Exported for use in other files) ---
type Settings = {
  volume: number;
  difficulty: string;
  particles: boolean;
  muted: boolean;
};

type Stats = {
  score: number;
  lives: number;
  wave: number;
  highScores: number[];
};

export interface GameState {
  settings: Settings;
  stats: Stats;
  paused: boolean;
  gameOver: boolean;
  gameStarted: boolean;
  // Canvas Ref is not stored in state, it's passed to the runGameLoop action
}

export interface GameActions {
  // Settings Actions
  setVolume: (v: number) => void;
  setDifficulty: (d: string) => void;
  setParticles: (b: boolean) => void;
  toggleMute: () => void;
  resetSettings: () => void;
  
  // Game Actions
  togglePause: () => void;
  startGame: () => void;
  restart: () => void;
  
  // Game Loop Management
  runGameLoop: (canvasRef: RefObject<HTMLCanvasElement | null>) => void;
  stopGameLoop: () => void;
}

export type GameStore = GameState & GameActions;

// --- PERSISTENT STATE INITIALIZATION ---
// This uses your existing custom hook to load initial values
const [initialSettings] = usePersistentState("ai:settings", {
  volume: 0.5,
  difficulty: "normal",
  particles: true,
  muted: false,
});
const [initialStats] = usePersistentState("ai:stats", {
  score: 0,
  lives: 3,
  wave: 1,
  highScores: [] as number[],
});

// --- ZUSTAND STORE CREATION ---
// rafRef is now internal to the store and managed by the actions
let rafRef: number | null = null;
let inputRef: ReturnType<typeof useInput> | null = null;
let setStatsPersistent: (value: Stats | ((prev: Stats) => Stats)) => void;
let setSettingsPersistent: (value: Settings | ((prev: Settings) => Settings)) => void;

// Initialize persistent state setters (Hack for local storage persistence within Zustand)
if (typeof window !== 'undefined') {
  const [, setS] = usePersistentState("ai:stats", initialStats);
  const [, setE] = usePersistentState("ai:settings", initialSettings);
  setStatsPersistent = setS;
  setSettingsPersistent = setE;
  inputRef = useInput();
}


export const useGameStore = create<GameStore>((set, get) => ({
  // --- STATE ---
  settings: initialSettings,
  stats: initialStats,
  paused: true, // Start paused, waiting for interaction
  gameOver: false,
  gameStarted: false,

  // --- ACTIONS ---
  
  // Settings
  setVolume: (v: number) => set((state) => {
      const newSettings = { ...state.settings, volume: v };
      setSettingsPersistent(newSettings);
      return { settings: newSettings };
  }),
  setDifficulty: (d: string) => set((state) => {
      const newSettings = { ...state.settings, difficulty: d };
      setSettingsPersistent(newSettings);
      return { settings: newSettings };
  }),
  setParticles: (b: boolean) => set((state) => {
      const newSettings = { ...state.settings, particles: b };
      setSettingsPersistent(newSettings);
      return { settings: newSettings };
  }),
  toggleMute: () => set((state) => {
      const newMuted = !state.settings.muted;
      const newSettings = { ...state.settings, muted: newMuted };
      setSettingsPersistent(newSettings);
      // Audio Control
      if (newMuted) fadeOutMusic();
      else playMusic("theme", newSettings.volume);
      return { settings: newSettings };
  }),
  resetSettings: () => {
    const defaultSettings = {
        volume: 0.5,
        difficulty: "normal",
        particles: true,
        muted: false,
    };
    setSettingsPersistent(defaultSettings);
    set({ settings: defaultSettings });
  },

  // Game Lifecycle
  togglePause: () => {
    set((state) => {
        const newPaused = !state.paused;
        // Audio Control
        if (newPaused) fadeOutMusic();
        else resumeMusic(state.settings.volume);
        return { paused: newPaused };
    });
  },

  startGame: () => {
    // Only start if not already started
    if (!get().gameStarted) {
        set({ gameStarted: true, paused: false });
        playMusic("theme", get().settings.volume);
    }
  },

  restart: () => {
    const newStats = {
      score: 0,
      lives: 3,
      wave: 1,
      highScores: get().stats.highScores,
    };
    setStatsPersistent(newStats);
    set({
      stats: newStats,
      gameOver: false,
      paused: false,
      gameStarted: true,
    });
    playMusic("theme", get().settings.volume);
  },

  // --- GAME LOOP ---
  runGameLoop: (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Stop any existing loop
    if (rafRef) cancelAnimationFrame(rafRef);

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    // Initial game objects (kept inside the loop scope for reset)
    const player: Player = {
        x: 240, y: 540, w: 48, h: 20, speed: config.playerSpeed,
    };
    const bullets: Bullet[] = [];
    let enemies: Enemy[] = []; // Allow mutation
    const enemyBullets: Bullet[] = [];
    const particles: Particle[] = [];

    // Local variables needed for the loop
    let last = performance.now();
    let difficultyMultiplier = 1;
    let descentSpeed = 6;
    let baseDescentSpeed = descentSpeed; // For resetting

    // Game logic functions (simplified or copied from the original hook)
    function rand(min: number, max: number) { return min + Math.random() * (max - min); }

    function spawnWave(n = 6) {
      const currentStats = get().stats;
      for (let i = 0; i < n; i++) {
        enemies.push({
          x: 40 + i * 70, y: 40, w: 36, h: 28,
          vx: (30 + Math.random() * 40) * (Math.random() < 0.5 ? 1 : -1),
          shootTimer: rand(1.0, 4.0) / difficultyMultiplier,
        });
      }
    }
    
    // Initial setup
    const currentStats = get().stats;
    spawnWave(6 * currentStats.wave);
    
    // Set difficulty based on current settings
    switch (get().settings.difficulty) {
        case "easy": difficultyMultiplier = 0.8; descentSpeed = 4; break;
        case "normal": difficultyMultiplier = 1; descentSpeed = 6; break;
        case "hard": difficultyMultiplier = 1.4; descentSpeed = 10; break;
    }

    function update(dt: number) {
        const state = get();
        if (!state.gameStarted || state.paused || state.gameOver) return;
        if (!canvas || !inputRef) return;
        const currentInput = inputRef;
        
        // Update difficulty if settings change (needed because this closure captures initial settings)
        switch (get().settings.difficulty) {
            case "easy": difficultyMultiplier = 0.8; descentSpeed = 4; break;
            case "normal": difficultyMultiplier = 1; descentSpeed = 6; break;
            case "hard": difficultyMultiplier = 1.4; descentSpeed = 10; break;
        }
        
        // --- Player Movement & Shooting Logic --- (Copied from original hook)
        if (currentInput.left) player.x -= player.speed * dt;
        if (currentInput.right) player.x += player.speed * dt;
        player.x = clamp(player.x, 0, canvas.width / dpr - player.w);

        if (currentInput.shoot && bullets.length < config.maxBullets) {
            bullets.push({
                x: player.x + player.w / 2 - 3, y: player.y - 10, vy: -500, w: 6, h: 10,
            });
            if (!state.settings.muted) playSound("shoot", state.settings.volume);
        }
        // ... (Remaining movement, collision, and spawn logic)
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y += bullets[i].vy * dt;
            if (bullets[i].y < -20) bullets.splice(i, 1);
        }

        for (let ei = enemies.length - 1; ei >= 0; ei--) {
            const e = enemies[ei];
            e.x += e.vx * dt;

            if (e.x < 10) {
                e.x = 10; e.vx *= -1;
            } else if (e.x > canvas.width / dpr - e.w - 10) {
                e.x = canvas.width / dpr - e.w - 10; e.vx *= -1;
            }

            e.y += baseDescentSpeed * dt;

            e.shootTimer -= dt;
            if (e.shootTimer <= 0) {
                enemyBullets.push({
                    x: e.x + e.w / 2 - 3, y: e.y + e.h + 4, 
                    vy: 180 + Math.random() * 120, w: 6, h: 10,
                });
                if (!state.settings.muted) playSound("shoot", state.settings.volume * 0.9);
                e.shootTimer = rand(1.0, 3.5) / difficultyMultiplier;
            }

            if (e.y + e.h >= player.y) {
                enemies.splice(ei, 1);
                if (!state.settings.muted) playSound("explode", state.settings.volume);
                
                // State update via setStatsPersistent and local set
                setStatsPersistent((s) => {
                    const newLives = s.lives - 1;
                    if (newLives <= 0) {
                        set({ gameOver: true }); // Zustand update
                        fadeOutMusic();
                    }
                    return { ...s, lives: newLives };
                });
                set((state) => ({ stats: { ...state.stats, lives: state.stats.lives - 1 } })); // Local Zustand update
            }
        }
        
        // Enemy bullets hitting player
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const b = enemyBullets[i];
            b.y += b.vy * dt;
            if (b.y > canvas.height / dpr + 20) {
                enemyBullets.splice(i, 1);
                continue;
            }

            const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
            const bulletRect = { x: b.x, y: b.y, w: b.w, h: b.h };
            if (detectCollisions(bulletRect, playerRect)) {
                enemyBullets.splice(i, 1);
                if (!state.settings.muted) playSound("explode", state.settings.volume);
                
                // State update via setStatsPersistent and local set
                setStatsPersistent((s) => {
                    const newLives = s.lives - 1;
                    if (newLives <= 0) {
                        set({ gameOver: true }); // Zustand update
                        fadeOutMusic();
                    }
                    return { ...s, lives: newLives };
                });
                set((state) => ({ stats: { ...state.stats, lives: state.stats.lives - 1 } })); // Local Zustand update
            }
        }
        
        // Player bullets hitting enemies
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (detectCollisions(bullets[i], enemies[j])) {
                    if (get().settings.particles) { // Check particles setting from store
                        for (let p = 0; p < 10; p++) {
                            particles.push({
                                x: enemies[j].x + enemies[j].w / 2, y: enemies[j].y + enemies[j].h / 2,
                                vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200, life: 0.6,
                            });
                        }
                    }
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    
                    // State update via setStatsPersistent and local set
                    const newStats = { ...get().stats, score: get().stats.score + 10 };
                    setStatsPersistent(newStats);
                    set({ stats: newStats });
                    
                    if (!state.settings.muted) playSound("explode", state.settings.volume);
                    break;
                }
            }
        }

        // Particle updates
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 300 * dt;
            p.life -= dt;
            if (p.life <= 0) particles.splice(i, 1);
        }
        
        // Wave spawning logic
        if (enemies.length === 0 && !get().gameOver) {
            const newStats = { ...get().stats, wave: get().stats.wave + 1 };
            setStatsPersistent(newStats);
            set({ stats: newStats });
            spawnWave(6 + newStats.wave);
        }
    }
    
    // --- DRAW & LOOP LOGIC --- (Copied from original hook)
    function draw() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#001018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#9bd";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.fillStyle = "#ffea00";
        bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

        ctx.fillStyle = "#ff4d4f";
        enemies.forEach((e) => ctx.fillRect(e.x, e.y, e.w, e.h));

        ctx.fillStyle = "#ff8c00";
        enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

        ctx.globalCompositeOperation = "lighter";
        particles.forEach((p) => {
            ctx.fillStyle = `rgba(255,200,50,${Math.max(0, p.life)})`;
            ctx.fillRect(p.x, p.y, 3, 3);
        });
        ctx.globalCompositeOperation = "source-over";
    }

    function loop(now = performance.now()) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        draw();
        rafRef = requestAnimationFrame(loop);
    }
    
    // Start the game loop
    rafRef = requestAnimationFrame(loop);

    // Cleanup function for the component unmounting
    return () => {
        if (rafRef) cancelAnimationFrame(rafRef);
        window.removeEventListener("resize", resize);
        stopMusic();
    };
  },
  
  stopGameLoop: () => {
    if (rafRef) cancelAnimationFrame(rafRef);
    rafRef = null;
  }
}));