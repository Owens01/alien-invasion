"use client";

import useInput from "./useInput";
import usePersistentState from "./usePersistentState";
import config from "../data/config";

import { useState, useEffect, useRef, RefObject } from "react";
import { clamp } from "../utils/clamp";
import { detectCollisions } from "../utils/collisions";
import {
  playSound,
  playMusic,
  fadeOutMusic,
  stopMusic,
  resumeMusic,
  toggleMusic,
  getMusicMuted,
} from "../utils/audio";

type Player = { x: number; y: number; w: number; h: number; speed: number };
type Bullet = { x: number; y: number; w: number; h: number; vy: number };
type Enemy = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  shootTimer: number;
};
type Particle = { x: number; y: number; vx: number; vy: number; life: number };

export default function useGame(
  canvasRef: RefObject<HTMLCanvasElement | null>
) {
  const [settings, setSettings] = usePersistentState("ai:settings", {
    volume: 0.5,
    difficulty: "normal",
    particles: true,
    muted: false,
  });

  const [stats, setStats] = usePersistentState("ai:stats", {
    score: 0,
    lives: 3,
    wave: 1,
    highScores: [] as number[],
  });

  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({ paused: false, gameStarted: false });
  const input = useInput();
  const [paused, setPaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // 🎵 Manage background music
  useEffect(() => {
    if (settings.muted) {
      fadeOutMusic();
      return;
    }

    if (paused || gameOver) {
      fadeOutMusic();
    } else if (gameStarted) {
      resumeMusic(settings.volume);
    }
  }, [paused, gameOver, gameStarted, settings.muted, settings.volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!ctx || !canvas) return;

      // Fill the parent container exactly
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect(); // size of the parent
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const player: Player = {
      x: 240,
      y: 540,
      w: 48,
      h: 20,
      speed: config.playerSpeed,
    };

    const bullets: Bullet[] = [];
    const enemies: Enemy[] = [];
    const enemyBullets: Bullet[] = [];
    const particles: Particle[] = [];

    // Difficulty scaling
    let difficultyMultiplier = 1;
    let descentSpeed = 6;

    switch (settings.difficulty) {
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

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function spawnWave(n = 6) {
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

    // Only spawn initial wave if game has started
    if (stateRef.current.gameStarted) {
      spawnWave(6 * stats.wave);
    }

    const baseDescentSpeed = descentSpeed;
    let last = performance.now();

    function update(dt: number) {
      // Don't update if game hasn't started
      if (!stateRef.current.gameStarted || stateRef.current.paused || gameOver)
        return;
      if (!canvas) return;

      const currentInput = inputRef.current;

      // Player movement
      if (currentInput.left) player.x -= player.speed * dt;
      if (currentInput.right) player.x += player.speed * dt;
      player.x = clamp(player.x, 0, canvas.width / dpr - player.w);

      // Shooting (player)
      if (currentInput.shoot && bullets.length < config.maxBullets) {
        bullets.push({
          x: player.x + player.w / 2 - 3,
          y: player.y - 10,
          vy: -500,
          w: 6,
          h: 10,
        });
        if (!settings.muted) playSound("shoot", settings.volume);
      }

      // Move bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].vy * dt;
        if (bullets[i].y < -20) bullets.splice(i, 1);
      }

      // Enemies movement and shooting
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];

        e.x += e.vx * dt;

        if (e.x < 10) {
          e.x = 10;
          e.vx *= -1;
        } else if (e.x > canvas.width / dpr - e.w - 10) {
          e.x = canvas.width / dpr - e.w - 10;
          e.vx *= -1;
        }

        e.y += baseDescentSpeed * dt;

        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          enemyBullets.push({
            x: e.x + e.w / 2 - 3,
            y: e.y + e.h + 4,
            vy: 180 + Math.random() * 120,
            w: 6,
            h: 10,
          });
          if (!settings.muted) playSound("shoot", settings.volume * 0.9);
          e.shootTimer = rand(1.0, 3.5) / difficultyMultiplier;
        }

        if (e.y + e.h >= player.y) {
          enemies.splice(ei, 1);
          if (!settings.muted) playSound("explode", settings.volume);
          setStats((s) => {
            const newLives = s.lives - 1;
            if (newLives <= 0) {
              setGameOver(true);
              fadeOutMusic();
            }
            return { ...s, lives: newLives };
          });
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

        const playerRect = {
          x: player.x,
          y: player.y,
          w: player.w,
          h: player.h,
        };
        const bulletRect = { x: b.x, y: b.y, w: b.w, h: b.h };
        if (detectCollisions(bulletRect, playerRect)) {
          enemyBullets.splice(i, 1);
          if (!settings.muted) playSound("explode", settings.volume);
          setStats((s) => {
            const newLives = s.lives - 1;
            if (newLives <= 0) {
              setGameOver(true);
              fadeOutMusic();
            }
            return { ...s, lives: newLives };
          });
        }
      }

      // Player bullets hitting enemies
      for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          if (detectCollisions(bullets[i], enemies[j])) {
            if (settings.particles) {
              for (let p = 0; p < 10; p++) {
                particles.push({
                  x: enemies[j].x + enemies[j].w / 2,
                  y: enemies[j].y + enemies[j].h / 2,
                  vx: (Math.random() - 0.5) * 200,
                  vy: (Math.random() - 0.5) * 200,
                  life: 0.6,
                });
              }
            }
            bullets.splice(i, 1);
            enemies.splice(j, 1);
            setStats((s) => ({ ...s, score: s.score + 10 }));
            if (!settings.muted) playSound("explode", settings.volume);
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

      if (enemies.length === 0 && !gameOver) {
        setStats((s) => ({ ...s, wave: s.wave + 1 }));
        spawnWave(6 + stats.wave);
      }
    }

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
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    function onKey(e: KeyboardEvent) {
      if (["p", "P", "Escape"].includes(e.key)) {
        stateRef.current.paused = !stateRef.current.paused;
        setPaused((prev) => !prev);
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      stopMusic();
    };
  }, [canvasRef, settings, stats.wave, gameOver, gameStarted, setStats]);

  const actions = {
    setVolume: (v: number) => setSettings((s) => ({ ...s, volume: v })),
    setDifficulty: (d: string) => setSettings((s) => ({ ...s, difficulty: d })),
    setParticles: (b: boolean) => setSettings((s) => ({ ...s, particles: b })),
    toggleMute: () => setSettings((s) => ({ ...s, muted: !s.muted })),
    getMuted: () => settings.muted,
    togglePause: () => {
      stateRef.current.paused = !stateRef.current.paused;
      setPaused((p) => !p);
    },

    startGame: () => {
      stateRef.current.gameStarted = true;
      setGameStarted(true);
    },

    restart: () => {
      setStats({
        score: 0,
        lives: 3,
        wave: 1,
        highScores: stats.highScores || [],
      });
      setGameOver(false);
      stateRef.current.gameStarted = true;
      setGameStarted(true);
      playMusic("theme", settings.volume);
    },

    resetSettings: () =>
      setSettings({
        volume: 0.5,
        difficulty: "normal",
        particles: true,
        muted: false,
      }),

    toggleMusic,
    getMusicMuted,
  };

  return {
    state: { ...settings, ...stats, paused, gameOver, gameStarted },
    actions,
  };
}
