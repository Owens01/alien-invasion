// hooks/useGameStore.ts (Core)
"use client";

import { create } from "zustand";
import { RefObject } from "react";
import useInput from "../../hooks/useInput";
import config from "../../data/config";
import { clamp } from "../../utils/clamp";
import { detectCollisions } from "../../utils/collisions";
import { playSound, playMusic, fadeOutMusic, resumeMusic, stopMusic } from "../../utils/audio";

// --- Import other stores ---
import { useSettingsStore, SettingsState } from "./useSettingsStore";
import { useStatsStore, StatsState } from "./useStatsStore";

// --- GAME OBJECT TYPES (Keep Local) ---
type Player = { x: number; y: number; w: number; h: number; speed: number };
type Bullet = { x: number; y: number; w: number; h: number; vy: number };
type Enemy = { x: number; y: number; w: number; h: number; vx: number; shootTimer: number; };
type Particle = { x: number; y: number; vx: number; vy: number; life: number };

// --- CORE GAME STATE ---
export interface GameState {
  paused: boolean;
  gameOver: boolean;
  gameStarted: boolean;
}

export interface GameActions {
  togglePause: () => void;
  startGame: () => void;
  restart: () => void;
  runGameLoop: (canvasRef: RefObject<HTMLCanvasElement | null>) => () => void;
  stopGameLoop: () => void;
}

export type GameStore = GameState & GameActions;

// --- INTERNAL GAME LOOP VARIABLES ---
let rafRef: number | null = null;
let inputRef: ReturnType<typeof useInput> | null = null;

// Initialize inputRef safely
if (typeof window !== 'undefined') {
  inputRef = useInput();
}

export const useGameStore = create<GameStore>((set, get) => ({
  // --- STATE ---
  paused: true, // Start paused, waiting for interaction
  gameOver: false,
  gameStarted: false,

  // --- ACTIONS ---
  togglePause: () => {
    set((state) => {
        const newPaused = !state.paused;
        const { muted, volume } = useSettingsStore.getState(); // Get current settings

        if (newPaused) {
          fadeOutMusic();
        } else if (state.gameStarted && !muted) {
          resumeMusic(volume);
        }
        return { paused: newPaused };
    });
  },

  startGame: () => {
    if (!get().gameStarted) {
        set({ gameStarted: true, paused: false });
        const { muted, volume } = useSettingsStore.getState();
        if (!muted) playMusic("theme", volume);
    }
  },

  restart: () => {
    const { highScores } = useStatsStore.getState();
    useStatsStore.getState().resetStats(highScores); // Reset Stats in its own store

    set({
      gameOver: false,
      paused: false,
      gameStarted: true,
    });
    const { muted, volume } = useSettingsStore.getState();
    if (!muted) playMusic("theme", volume);
  },

  // --- GAME LOOP ---
  runGameLoop: (canvasRef: RefObject<HTMLCanvasElement | null>) => {
    
    // --- Local store getter to access other stores inside the loop closure ---
    const getSettings = () => useSettingsStore.getState();
    const getStats = () => useStatsStore.getState();
    const updateStats = useStatsStore.getState(); // Get actions once

    const canvas = canvasRef.current;
    if (!canvas) return stopMusic;

    // ... (Initialization, resizing, game objects are the same)
    const ctx = canvas.getContext("2d");
    if (!ctx) return stopMusic; 
    
    // ... (Other initialization logic is skipped for brevity, assumed to be correct)
    
    // Initial game objects 
    const player: Player = { x: 240, y: 540, w: 48, h: 20, speed: config.playerSpeed };
    const bullets: Bullet[] = [];
    let enemies: Enemy[] = []; 
    const enemyBullets: Bullet[] = [];
    const particles: Particle[] = [];
    let last = performance.now();
    let difficultyMultiplier = 1;
    let descentSpeed = 6;
    let baseDescentSpeed = descentSpeed; 

    // Game logic functions (rand, spawnWave... same as before)
    function rand(min: number, max: number) { return min + Math.random() * (max - min); }
    function spawnWave(n = 6) {
        // ... spawn logic using n and difficultyMultiplier
        for (let i = 0; i < n; i++) {
          enemies.push({
            x: 40 + i * 70, y: 40, w: 36, h: 28,
            vx: (30 + Math.random() * 40) * (Math.random() < 0.5 ? 1 : -1),
            shootTimer: rand(1.0, 4.0) / difficultyMultiplier,
          });
        }
    }
    
    // Initial setup
    const initialStats = getStats();
    // Set difficulty based on current settings
    switch (getSettings().difficulty) {
        case "easy": difficultyMultiplier = 0.8; descentSpeed = 4; baseDescentSpeed = 4; break;
        case "normal": difficultyMultiplier = 1; descentSpeed = 6; baseDescentSpeed = 6; break;
        case "hard": difficultyMultiplier = 1.4; descentSpeed = 10; baseDescentSpeed = 10; break;
    }
    spawnWave(6 * initialStats.wave);

    function update(dt: number) {
        const coreState = get();
        const settings = getSettings();
        const stats = getStats(); // Get latest stats
        
        if (!coreState.gameStarted || coreState.paused || coreState.gameOver) return;
        if (!canvas || !inputRef) return;
        const currentInput = inputRef;

        // Update difficulty (re-read from store)
        // ... (Difficulty switch statement is the same)
        
        // --- Player Movement & Shooting Logic ---
        // ... (Movement logic is the same)
        if (currentInput.shoot && bullets.length < config.maxBullets) {
            bullets.push({ x: player.x + player.w / 2 - 3, y: player.y - 10, vy: -500, w: 6, h: 10 });
            if (!settings.muted) playSound("shoot", settings.volume);
        }
        // ... (Bullet movement logic)

        // --- Collision Logic (Enemy vs Player/Bottom) ---
        for (let ei = enemies.length - 1; ei >= 0; ei--) {
            const e = enemies[ei];
            // ... (Enemy movement/shooting logic)

            if (e.y + e.h >= player.y) {
                enemies.splice(ei, 1);
                if (!settings.muted) playSound("explode", settings.volume);
                
                // 🚨 ACTION CALL TO STATS STORE
                updateStats.decrementLives(); 
                
                // Check for Game Over *after* decrementing lives
                if (stats.lives - 1 <= 0) {
                  set({ gameOver: true }); 
                  fadeOutMusic();
                }
            }
        }
        
        // --- Collision Logic (Enemy Bullet vs Player) ---
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            // ... (Collision check is the same)
            if (detectCollisions({ x: enemyBullets[i].x, y: enemyBullets[i].y, w: enemyBullets[i].w, h: enemyBullets[i].h }, player)) {
                enemyBullets.splice(i, 1);
                if (!settings.muted) playSound("explode", settings.volume);
                
                // 🚨 ACTION CALL TO STATS STORE
                updateStats.decrementLives(); 
                
                if (stats.lives - 1 <= 0) {
                  set({ gameOver: true }); 
                  fadeOutMusic();
                }
            }
        }
        
        // --- Collision Logic (Player Bullet vs Enemy) ---
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (detectCollisions(bullets[i], enemies[j])) {
                    if (settings.particles) { /* ... particle creation ... */ }
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    
                    // 🚨 ACTION CALL TO STATS STORE
                    updateStats.updateScore(10);
                    
                    if (!settings.muted) playSound("explode", settings.volume);
                    break;
                }
            }
        }

        // Wave spawning logic
        if (enemies.length === 0 && !coreState.gameOver) {
            // 🚨 ACTION CALL TO STATS STORE
            updateStats.incrementWave();
            spawnWave(6 + stats.wave + 1); // stats.wave is now the previous wave, so +1
        }
    }
    
    // ... (draw and loop functions are the same)

    function loop(now = performance.now()) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        // ... (draw call)
        rafRef = requestAnimationFrame(loop);
    }
    
    // Start the game loop
    rafRef = requestAnimationFrame(loop);

    // Cleanup function
    return () => { /* ... cleanup logic ... */ };
  },
  
  stopGameLoop: () => {
    if (rafRef) cancelAnimationFrame(rafRef);
    rafRef = null;
  }
}));