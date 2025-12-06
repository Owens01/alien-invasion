"use client";

import { MutableRefObject } from "react";
import config from "../data/config";
import { clamp } from "../utils/clamp";
import { detectCollisions } from "../utils/collisions";
import { playSound } from "../utils/audio";
import { InternalGameState, Settings, Stats } from "../types/gameTypes";
import { InputState } from "../types/types";

export function useGameLogic(
  gameStateRef: MutableRefObject<InternalGameState>,
  settingsRef: MutableRefObject<Settings>,
  statsRef: MutableRefObject<Stats>,
  inputRef: MutableRefObject<InputState>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  setStats: (value: Stats | ((val: Stats) => Stats)) => void,
  setGameOver: (go: boolean) => void
) {
  function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  function spawnWave(n = 6) {
    console.log("🚀 SPAWNING WAVE with", n, "enemies");
    // Get difficulty from ref
    const currentSettings = settingsRef.current;
    let difficultyMultiplier = 1;
    let bigEnemyHealth = 3; // Default for easy

    switch (currentSettings.difficulty) {
      case "easy":
        difficultyMultiplier = 0.8;
        bigEnemyHealth = 3;
        break;
      case "normal":
        difficultyMultiplier = 1;
        bigEnemyHealth = 6;
        break;
      case "hard":
        difficultyMultiplier = 1.4;
        bigEnemyHealth = 9;
        break;
    }

    const scale = gameStateRef.current.scaleFactor || 1;
    const currentWave = statsRef.current.wave;

    // Determine creature type based on wave number
    let creatureType = 0;
    if (currentWave >= 7) {
      creatureType = 3; // Crystalline entity
    } else if (currentWave >= 5) {
      creatureType = 2; // Biomechanical horror
    } else if (currentWave >= 3) {
      creatureType = 1; // Insect-like
    } else {
      creatureType = 0; // Octopus-like
    }

    gameStateRef.current.activeCreatureType = creatureType;

    // Determine which enemies will be big
    // Number of big enemies = wave number (wave 1 = 1 big, wave 2 = 2 big, etc.)
    const numBigEnemies = Math.min(currentWave, n);
    const bigEnemyIndices = new Set<number>();

    // Randomly select which enemies will be big
    while (bigEnemyIndices.size < numBigEnemies) {
      bigEnemyIndices.add(Math.floor(Math.random() * n));
    }

    for (let i = 0; i < n; i++) {
      const isBig = bigEnemyIndices.has(i);
      const sizeMultiplier = isBig ? 1.8 : 1;
      const health = isBig ? bigEnemyHealth : 1;

      gameStateRef.current.enemies.push({
        x: 40 + i * 70 * scale,
        y: 40,
        w: 36 * scale * sizeMultiplier,
        h: 28 * scale * sizeMultiplier,
        vx: (30 + Math.random() * 40) * (Math.random() < 0.5 ? 1 : -1),
        shootTimer: rand(1, 4) / difficultyMultiplier,
        creatureType: creatureType,
        health: health,
        maxHealth: health,
        isBig: isBig,
        healthDisplayTimer: 0,
      });
    }
  }

  function update(dt: number) {
    const state = gameStateRef.current;
    const currentSettings = settingsRef.current;
    const currentStats = statsRef.current;
    const canvas = canvasRef.current;

    // Stop update if game not started, paused, OR game over
    if (!state.gameStarted || state.paused || state.gameOver) {
      return;
    }

    // Check canvas existence
    if (!canvas) return;

    // Decay screen shake
    if (state.shake > 0) {
      state.shake *= 0.9;
      if (state.shake < 0.5) state.shake = 0;
    }

    // Spawn initial wave when game starts
    if (!state.initialWaveSpawned) {
      console.log("🎮 First update - spawning initial wave");
      spawnWave(6 * currentStats.wave);
      state.initialWaveSpawned = true;
    }

    // Difficulty scaling
    let difficultyMultiplier = 1;
    let descentSpeed = 6;
    switch (currentSettings.difficulty) {
      case "easy":
        difficultyMultiplier = 0.8;
        descentSpeed = 4;
        break;
      case "normal":
        difficultyMultiplier = 1;
        descentSpeed = 6;
        break;
      case "hard":
        difficultyMultiplier = 1.4;
        descentSpeed = 10;
        break;
    }

    const currentInput = inputRef.current;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Player movement
    const p = state.player;
    if (currentInput.left) p.x -= p.speed * dt;
    if (currentInput.right) p.x += p.speed * dt;
    if (currentInput.up) p.y -= p.speed * dt;
    if (currentInput.down) p.y += p.speed * dt;
    p.x = clamp(p.x, 0, width - p.w);
    p.y = clamp(p.y, 0, height - p.h);

    // Player shooting
    // Only shoot if button is pressed AND was not pressed last frame (trigger logic)
    if (
      currentInput.shoot &&
      !gameStateRef.current.lastShoot &&
      state.bullets.length < config.maxBullets
    ) {
      state.bullets.push({
        x: p.x + p.w / 2 - 3,
        y: p.y - 10,
        vy: -500,
        w: 6,
        h: 10,
      });
      if (!currentSettings.muted)
        playSound("playerShoot", currentSettings.volume);
    }

    // Update lastShoot state for next frame
    state.lastShoot = currentInput.shoot;

    // Move bullets
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      state.bullets[i].y += state.bullets[i].vy * dt;
      if (state.bullets[i].y < -20) state.bullets.splice(i, 1);
    }

    // Enemy movement & shooting
    for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
      const e = state.enemies[ei];
      e.x += e.vx * dt;
      if (e.x < 10) {
        e.x = 10;
        e.vx *= -1;
      } else if (e.x > width - e.w - 10) {
        e.x = width - e.w - 10;
        e.vx *= -1;
      }

      // Decrease health display timer
      if (e.healthDisplayTimer > 0) {
        e.healthDisplayTimer -= dt;
      }

      e.y += descentSpeed * dt;
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        const isBig = e.isBig;
        const bulletW = isBig ? 12 : 6;
        const bulletH = isBig ? 20 : 10;

        state.enemyBullets.push({
          x: e.x + e.w / 2 - bulletW / 2,
          y: e.y + e.h + 4,
          vy: 180 + Math.random() * 120,
          w: bulletW,
          h: bulletH,
          isBig: isBig,
        });
        if (!currentSettings.muted)
          playSound("enemyShoot", currentSettings.volume * 0.9);
        e.shootTimer = rand(1, 3.5) / difficultyMultiplier;
      }

      if (e.y + e.h >= p.y) {
        state.enemies.splice(ei, 1);
        if (!currentSettings.muted)
          playSound("explode", currentSettings.volume);
        // Screen shake on player hit
        state.shake = 20;
        setStats((s) => {
          const newLives = s.lives - 1;
          if (newLives <= 0) {
            setGameOver(true);
            state.gameOver = true; // Set internal flag immediately
            return { ...s, lives: 0 }; // Ensure no negative lives
          }
          return { ...s, lives: newLives };
        });
      }
    }

    // Enemy bullets hitting player
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      b.y += b.vy * dt;
      if (b.y > height + 20) {
        state.enemyBullets.splice(i, 1);
        continue;
      }

      const playerRect = {
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
      };
      if (detectCollisions(b, playerRect)) {
        state.enemyBullets.splice(i, 1);
        if (!currentSettings.muted)
          playSound("explode", currentSettings.volume);
        // Screen shake on player hit by bullet
        state.shake = 20;
        setStats((s) => {
          const newLives = s.lives - 1;
          if (newLives <= 0) {
            setGameOver(true);
            state.gameOver = true; // Set internal flag immediately
            return { ...s, lives: 0 }; // Ensure no negative lives
          }
          return { ...s, lives: newLives };
        });
      }
    }

    // Player bullets hitting enemies
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        if (detectCollisions(state.bullets[i], state.enemies[j])) {
          const enemy = state.enemies[j];

          // Reduce enemy health
          enemy.health -= 1;

          // Show health display for big enemies
          if (enemy.isBig) {
            enemy.healthDisplayTimer = 2.0; // Show for 2 seconds
          }

          // Create particles on hit
          if (currentSettings.particles) {
            for (let p = 0; p < 10; p++) {
              state.particles.push({
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h / 2,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 0.6,
                color: enemy.isBig ? "#ff00ff" : "#ffea00", // Different colors for big enemies
              });
            }
          }

          // Remove bullet
          state.bullets.splice(i, 1);

          // Play sound on hit
          if (!currentSettings.muted)
            playSound("explode", currentSettings.volume);

          // Only destroy enemy if health reaches 0
          if (enemy.health <= 0) {
            state.enemies.splice(j, 1);
            // Screen shake on enemy destruction
            state.shake = enemy.isBig ? 15 : 5;

            // More particles for destruction
            if (currentSettings.particles) {
              for (let p = 0; p < 15; p++) {
                state.particles.push({
                  x: enemy.x + enemy.w / 2,
                  y: enemy.y + enemy.h / 2,
                  vx: (Math.random() - 0.5) * 300,
                  vy: (Math.random() - 0.5) * 300,
                  life: 0.8,
                  color: "#ff4d4f",
                });
              }
            }

            // Award points based on enemy type
            const points = enemy.isBig ? 30 : 10;
            setStats((s) => {
              const newScore = s.score + points;
              const newHighScore = Math.max(newScore, s.highScore);
              return { ...s, score: newScore, highScore: newHighScore };
            });
          }

          break;
        }
      }
    }

    // Particle updates
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 300 * dt;
      pt.life -= dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    // Wave completion
    if (state.enemies.length === 0) {
      setStats((s) => ({ ...s, wave: s.wave + 1 }));
      const newWave = statsRef.current.wave + 1; // Wait, statsRef might not be updated yet if setStats is async?
      // Actually setStats updates React state, but statsRef is updated via useEffect in useGame.ts
      // So statsRef.current.wave is the OLD wave still?
      // In the original code:
      /*
        setStats((s) => ({ ...s, wave: s.wave + 1 }));
        const newWave = statsRef.current.wave + 1;
        spawnWave(6 + newWave);
      */
      // If statsRef is updated via useEffect, it won't be updated synchronously here.
      // So statsRef.current.wave is indeed the old wave.
      // And we use statsRef.current.wave + 1, so that's correct logic relative to the original.
      spawnWave(6 + newWave);
    }
  }

  return { update };
}
