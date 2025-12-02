// hooks/useGameStore.ts (Core)
"use client";

import { create } from "zustand";
import { RefObject } from "react";
import config from "../../data/config";
import { clamp } from "../../utils/clamp";
import { detectCollisions } from "../../utils/collisions";
import { playSound, playMusic, fadeOutMusic, resumeMusic, stopMusic } from "../../utils/audio";

// --- Import required types ---
import { InputState } from "@/types/types";
import { useSettingsStore } from "./useSettingsStore";
import { useStatsStore } from "./useStatsStore";

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
  runGameLoop: (canvasRef: RefObject<HTMLCanvasElement | null>, currentInput: InputState) => () => void;
  stopGameLoop: () => void;
}

export type GameStore = GameState & GameActions;

// --- INTERNAL GAME LOOP VARIABLES ---
let rafRef: number | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  // --- STATE ---
  paused: true, 
  gameOver: false,
  gameStarted: false,

  // --- ACTIONS ---
  togglePause: () => {
    set((state) => {
        const newPaused = !state.paused;
        const { muted, volume } = useSettingsStore.getState(); 

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
    useStatsStore.getState().resetStats(highScores); 

    set({
      gameOver: false,
      paused: false,
      gameStarted: true,
    });
    const { muted, volume } = useSettingsStore.getState();
    if (!muted) playMusic("theme", volume);
  },

  // --- GAME LOOP ---
  runGameLoop: (canvasRef: RefObject<HTMLCanvasElement | null>, currentInput: InputState) => {
    
    // --- Local store getters ---
    const getSettings = () => useSettingsStore.getState();
    const getStats = () => useStatsStore.getState();
    const updateStats = useStatsStore.getState(); 

    const canvas = canvasRef.current;
    if (!canvas) return stopMusic;

    const ctx = canvas.getContext("2d");
    if (!ctx) return stopMusic; 
    
    // --- Initial game objects ---
    const player: Player = { x: 240, y: 540, w: 48, h: 20, speed: config.playerSpeed };
    const bullets: Bullet[] = [];
    const enemies: Enemy[] = []; 
    const enemyBullets: Bullet[] = [];
    const particles: Particle[] = [];
    let last = performance.now();
    let difficultyMultiplier = 1;
    let descentSpeed = 6;
    let baseDescentSpeed = descentSpeed; 

    // --- Helper Functions ---
    function rand(min: number, max: number) { 
      return min + Math.random() * (max - min); 
    }
    
    function spawnWave(n = 6) {
        const stats = getStats();
        // Reset and scale descent speed based on wave progression
        descentSpeed = baseDescentSpeed * (1 + stats.wave * 0.05);
        
        for (let i = 0; i < n; i++) {
          enemies.push({
            x: 40 + i * 70, 
            y: 40, 
            w: 36, 
            h: 28,
            vx: (30 + Math.random() * 40) * (Math.random() < 0.5 ? 1 : -1),
            shootTimer: rand(1.0, 4.0) / difficultyMultiplier,
          });
        }
    }
    
    // --- Initial setup ---
    const initialStats = getStats();
    
    // Set difficulty based on current settings
    switch (getSettings().difficulty) {
        case "easy": 
          difficultyMultiplier = 0.8; 
          descentSpeed = 4; 
          baseDescentSpeed = 4; 
          break;
        case "normal": 
          difficultyMultiplier = 1; 
          descentSpeed = 6; 
          baseDescentSpeed = 6; 
          break;
        case "hard": 
          difficultyMultiplier = 1.4; 
          descentSpeed = 10; 
          baseDescentSpeed = 10; 
          break;
    }
    
    spawnWave(6 * initialStats.wave);

    // --- UPDATE FUNCTION ---
    function update(dt: number) {
        const coreState = get();
        const settings = getSettings();
        const stats = getStats();
        
        if (!coreState.gameStarted || coreState.paused || coreState.gameOver) return;
        if (!canvas) return;

        // --- Player Movement & Boundary Clamping ---
        if (currentInput.left) player.x -= player.speed * dt;
        if (currentInput.right) player.x += player.speed * dt;
        player.x = clamp(player.x, 0, canvas.width - player.w);

        // --- Player Shooting ---
        if (currentInput.shoot && bullets.length < config.maxBullets) {
            bullets.push({ 
              x: player.x + player.w / 2 - 3, 
              y: player.y - 10, 
              vy: -500, 
              w: 6, 
              h: 10 
            });
            if (!settings.muted) playSound("shoot", settings.volume);
        }

        // --- Update Player Bullets ---
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y += bullets[i].vy * dt;
            if (bullets[i].y + bullets[i].h < 0) {
                bullets.splice(i, 1);
            }
        }

        // --- Update Enemy Bullets ---
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].y += enemyBullets[i].vy * dt;
            if (enemyBullets[i].y > canvas.height) {
                enemyBullets.splice(i, 1);
            }
        }

        // --- Update Enemies ---
        for (let ei = enemies.length - 1; ei >= 0; ei--) {
            const e = enemies[ei];
            
            // Move enemy horizontally
            e.x += e.vx * dt;
            
            // Bounce at boundaries and descend
            if (e.x <= 0 || e.x + e.w >= canvas.width) {
                e.vx = -e.vx;
                e.x = clamp(e.x, 0, canvas.width - e.w);
                e.y += descentSpeed;
            }

            // Enemy shooting logic
            e.shootTimer -= dt;
            if (e.shootTimer <= 0) {
                enemyBullets.push({ 
                  x: e.x + e.w / 2 - 3, 
                  y: e.y + e.h, 
                  vy: 200, 
                  w: 6, 
                  h: 10 
                });
                e.shootTimer = rand(2.0, 5.0) / difficultyMultiplier;
                if (!settings.muted) playSound("shoot", settings.volume);
            }

            // Check if enemy reached player level (Game Over condition)
            if (e.y + e.h >= player.y) {
                enemies.splice(ei, 1);
                if (!settings.muted) playSound("explode", settings.volume);
                
                updateStats.decrementLives(); 
                
                if (stats.lives - 1 <= 0) {
                  set({ gameOver: true }); 
                  fadeOutMusic();
                }
            }
        }

        // --- Update Particles ---
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // --- Collision: Enemy Bullet vs Player ---
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            if (detectCollisions(enemyBullets[i], player)) {
                enemyBullets.splice(i, 1);
                if (!settings.muted) playSound("explode", settings.volume);
                
                updateStats.decrementLives(); 
                
                if (stats.lives - 1 <= 0) {
                  set({ gameOver: true }); 
                  fadeOutMusic();
                }
            }
        }
        
        // --- Collision: Player Bullet vs Enemy ---
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (detectCollisions(bullets[i], enemies[j])) {
                    
                    // Create particle explosion
                    if (settings.particles) {
                        const ex = enemies[j].x + enemies[j].w / 2;
                        const ey = enemies[j].y + enemies[j].h / 2;
                        for (let p = 0; p < 8; p++) {
                            particles.push({
                                x: ex,
                                y: ey,
                                vx: rand(-100, 100),
                                vy: rand(-100, 100),
                                life: rand(0.3, 0.8)
                            });
                        }
                    }
                    
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    
                    updateStats.updateScore(10);
                    
                    if (!settings.muted) playSound("explode", settings.volume);
                    break;
                }
            }
        }

        // --- Wave Completion Logic ---
        if (enemies.length === 0 && !coreState.gameOver) {
            updateStats.incrementWave();
            spawnWave(6 + stats.wave + 1);
        }
    }
    
    // --- DRAW FUNCTION ---
    function draw() {
        if (!ctx || !canvas) return;
        
        // Clear canvas
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player
        ctx.fillStyle = "#0f0";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        // Draw player bullets
        ctx.fillStyle = "#0ff";
        for (const b of bullets) {
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }

        // Draw enemies
        ctx.fillStyle = "#f00";
        for (const e of enemies) {
            ctx.fillRect(e.x, e.y, e.w, e.h);
        }

        // Draw enemy bullets
        ctx.fillStyle = "#f0f";
        for (const b of enemyBullets) {
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }

        // Draw particles
        ctx.fillStyle = "#ff6";
        for (const p of particles) {
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
        ctx.globalAlpha = 1;
    }

    // --- GAME LOOP ---
    function loop(now = performance.now()) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        draw();
        rafRef = requestAnimationFrame(loop);
    }
    
    // Start the game loop
    rafRef = requestAnimationFrame(loop);

    // Cleanup function
    return () => { 
        if (rafRef) cancelAnimationFrame(rafRef);
        rafRef = null;
        stopMusic();
    };
  },
  
  stopGameLoop: () => {
    if (rafRef) cancelAnimationFrame(rafRef);
    rafRef = null;
    stopMusic();
  }
}));