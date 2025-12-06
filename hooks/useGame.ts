"use client";

import useInput from "./useInput";
import usePersistentState from "./usePersistentState";
import config from "../data/config";

import {
  useState,
  useEffect,
  useRef,
  RefObject,
  useCallback,
  useMemo,
} from "react";
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
type Bullet = {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  isBig?: boolean;
};
type Enemy = {
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
    highScore: 0,
  });

  const rafRef = useRef<number | null>(null);

  // Create a ref to hold all mutable game entities so we can reset them from outside the loop
  // Detect if screen is small (mobile)
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Scale factor for small screens
  const scaleFactor = isSmallScreen ? 0.7 : 1;

  const gameStateRef = useRef({
    player: {
      x: 240,
      y: 540,
      w: 48 * scaleFactor,
      h: 20 * scaleFactor,
      speed: config.playerSpeed,
    } as Player,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    enemyBullets: [] as Bullet[],
    particles: [] as Particle[],
    initialWaveSpawned: false,
    paused: false,
    gameStarted: false,
    gameOver: false, // Internal game over flag for loop logic
    scaleFactor: scaleFactor, // Store scale factor in game state
  });

  // Refs for creature images
  const creatureImages = useRef<HTMLImageElement[]>([]);
  const playerShipImage = useRef<HTMLImageElement | null>(null);
  const imagesLoaded = useRef(false);

  // Update scale factor when screen size changes
  useEffect(() => {
    gameStateRef.current.scaleFactor = scaleFactor;
    // Update player size when scale changes
    gameStateRef.current.player.w = 48 * scaleFactor;
    gameStateRef.current.player.h = 20 * scaleFactor;
  }, [scaleFactor]);

  // Store settings and stats in refs so they don't trigger re-renders
  const settingsRef = useRef(settings);
  const statsRef = useRef(stats);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const input = useInput();
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Sync ref state with React state
  useEffect(() => {
    gameStateRef.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    gameStateRef.current.gameOver = gameOver;
  }, [gameOver]);

  useEffect(() => {
    gameStateRef.current.gameStarted = gameStarted;
  }, [gameStarted]);

  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Background music
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

    // Initialize player position on mount/resize if needed, but we do it in restart/init mostly

    console.log("🎬 useEffect running - initializing game");

    // Load creature images and player ship

    const loadImages = () => {
      const creaturePromises = [
        "/creature1.png",
        "/creature2.png",
        "/creature3.png",
        "/creature4.png",
      ].map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            creatureImages.current[index] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load ${src}`);
            resolve(); // Still resolve to not block other images
          };
          img.src = src;
        });
      });

      // Load player ship
      const playerShipPromise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          playerShipImage.current = img;
          resolve();
        };
        img.onerror = () => {
          console.warn("Failed to load player ship");
          resolve();
        };
        img.src = "/player-ship.png";
      });

      Promise.all([...creaturePromises, playerShipPromise]).then(() => {
        imagesLoaded.current = true;
        console.log("✅ All images loaded (creatures + player ship)");
      });
    };

    loadImages();

    // --- Resize function to match parent exactly ---
    function resize() {
      if (!ctx || !canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keep player strictly within bounds on resize
      const width = rect.width;
      const height = rect.height;
      const p = gameStateRef.current.player;
      p.x = clamp(p.x, 0, width - p.w);
      p.y = clamp(p.y, 0, height - p.h);
    }

    // Initial resize after next paint
    requestAnimationFrame(resize);
    window.addEventListener("resize", resize);

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

    let last = performance.now();

    function update(dt: number) {
      const state = gameStateRef.current;
      const currentSettings = settingsRef.current;
      const currentStats = statsRef.current;

      // Stop update if game not started, paused, OR game over
      if (!state.gameStarted || state.paused || state.gameOver) {
        return;
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
      const width = canvas!.width / (window.devicePixelRatio || 1);
      const height = canvas!.height / (window.devicePixelRatio || 1);

      // Player movement
      const p = state.player;
      if (currentInput.left) p.x -= p.speed * dt;
      if (currentInput.right) p.x += p.speed * dt;
      if (currentInput.up) p.y -= p.speed * dt;
      if (currentInput.down) p.y += p.speed * dt;
      p.x = clamp(p.x, 0, width - p.w);
      p.y = clamp(p.y, 0, height - p.h);

      // Player shooting
      if (currentInput.shoot && state.bullets.length < config.maxBullets) {
        state.bullets.push({
          x: p.x + p.w / 2 - 3,
          y: p.y - 10,
          vy: -500,
          w: 6,
          h: 10,
        });
        if (!currentSettings.muted) playSound("shoot", currentSettings.volume);
      }

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
            playSound("shoot", currentSettings.volume * 0.9);
          e.shootTimer = rand(1, 3.5) / difficultyMultiplier;
        }

        if (e.y + e.h >= p.y) {
          state.enemies.splice(ei, 1);
          if (!currentSettings.muted)
            playSound("explode", currentSettings.volume);
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
        const newWave = statsRef.current.wave + 1;
        spawnWave(6 + newWave);
      }
    }

    function draw() {
      if (!ctx || !canvas) return;
      const state = gameStateRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#001018";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw player ship
      if (imagesLoaded.current && playerShipImage.current) {
        const img = playerShipImage.current;
        const imgAspect = img.width / img.height;
        const boundsAspect = state.player.w / state.player.h;

        let drawWidth = state.player.w;
        let drawHeight = state.player.h;
        let offsetX = 0;
        let offsetY = 0;

        // Fit image to bounds while maintaining aspect ratio
        if (imgAspect > boundsAspect) {
          // Image is wider - fit to width
          drawHeight = state.player.w / imgAspect;
          offsetY = (state.player.h - drawHeight) / 2;
        } else {
          // Image is taller - fit to height
          drawWidth = state.player.h * imgAspect;
          offsetX = (state.player.w - drawWidth) / 2;
        }

        ctx.drawImage(
          img,
          state.player.x + offsetX,
          state.player.y + offsetY,
          drawWidth,
          drawHeight
        );
      } else {
        // Fallback to rectangle if image not loaded
        ctx.fillStyle = "#9bd";
        ctx.fillRect(
          state.player.x,
          state.player.y,
          state.player.w,
          state.player.h
        );
      }

      ctx.fillStyle = "#ffea00";
      state.bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Draw enemies with creature images
      state.enemies.forEach((e) => {
        if (imagesLoaded.current && creatureImages.current[e.creatureType]) {
          const img = creatureImages.current[e.creatureType];
          // Draw image centered within enemy bounds, preserving aspect ratio
          const imgAspect = img.width / img.height;
          const boundsAspect = e.w / e.h;

          let drawWidth = e.w;
          let drawHeight = e.h;
          let offsetX = 0;
          let offsetY = 0;

          // Fit image to bounds while maintaining aspect ratio
          if (imgAspect > boundsAspect) {
            // Image is wider - fit to width
            drawHeight = e.w / imgAspect;
            offsetY = (e.h - drawHeight) / 2;
          } else {
            // Image is taller - fit to height
            drawWidth = e.h * imgAspect;
            offsetX = (e.w - drawWidth) / 2;
          }

          // Visual feedback for damaged enemies
          const healthPercent = e.health / e.maxHealth;
          ctx.globalAlpha = 0.3 + healthPercent * 0.7; // Range from 0.3 to 1.0

          ctx.drawImage(
            img,
            e.x + offsetX,
            e.y + offsetY,
            drawWidth,
            drawHeight
          );

          ctx.globalAlpha = 1.0; // Reset alpha

          // Draw health number for big enemies if timer is active
          if (e.isBig && e.healthDisplayTimer > 0) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(e.health.toString(), e.x + e.w / 2, e.y + e.h / 2);
          }
        } else {
          // Fallback to rectangle if images not loaded
          ctx.fillStyle = "#ff4d4f";
          ctx.fillRect(e.x, e.y, e.w, e.h);
        }
      });

      ctx.fillStyle = "#ff8c00";
      state.enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

      ctx.globalCompositeOperation = "lighter";
      state.particles.forEach((p) => {
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

    // Pause key
    function onKey(e: KeyboardEvent) {
      if (["p", "P", "Escape"].includes(e.key)) {
        if (!gameStateRef.current.gameOver) {
          setPaused((prev) => !prev);
        }
      }
    }
    window.addEventListener("keydown", onKey);

    return () => {
      console.log("🛑 Cleaning up game loop");
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
      stopMusic();
    };
  }, [canvasRef]); // ONLY canvasRef as dependency!

  const actions = useMemo(
    () => ({
      setVolume: (v: number) => setSettings((s) => ({ ...s, volume: v })),
      setDifficulty: (d: string) =>
        setSettings((s) => ({ ...s, difficulty: d })),
      setParticles: (b: boolean) =>
        setSettings((s) => ({ ...s, particles: b })),
      toggleMute: () => setSettings((s) => ({ ...s, muted: !s.muted })),
      getMuted: () => settings.muted,
      togglePause: () => {
        if (!gameOver) {
          setPaused((p) => !p);
        }
      },
      setPauseState: (shouldPause: boolean) => {
        if (!gameOver) {
          setPaused(shouldPause);
        }
      },
      startGame: () => {
        console.log("🎮 START GAME CALLED");
        setGameStarted(true);
      },
      restart: () => {
        console.log("🔄 RESTART GAME");

        // 1. Reset persisted stats
        setStats((s) => ({
          score: 0,
          lives: 3,
          wave: 1,
          highScores: s.highScores || [],
          highScore: s.highScore,
        }));

        // 2. Clear all game entities in the ref
        const state = gameStateRef.current;
        state.bullets = [];
        state.enemies = [];
        state.enemyBullets = [];
        state.particles = [];

        // 3. Reset player position and size
        const scale = state.scaleFactor || 1;
        state.player.x = 240;
        state.player.y = 540;
        state.player.w = 48 * scale;
        state.player.h = 20 * scale;

        // 4. Reset flags
        state.initialWaveSpawned = false;
        state.gameOver = false;
        state.paused = false;
        state.gameStarted = true;

        // 5. Reset React state
        setGameOver(false);
        setPaused(false);
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
    }),
    [
      gameOver,
      settings.muted,
      settings.volume,
      setSettings,
      setStats,
      setPaused,
      setGameStarted,
    ]
  ); // Add dependencies used inside actions

  const state = useMemo(
    () => ({ ...settings, ...stats, paused, gameOver, gameStarted }),
    [settings, stats, paused, gameOver, gameStarted]
  );

  return {
    state,
    actions,
  };
}
