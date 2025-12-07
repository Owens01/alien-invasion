"use client";

import useInput from "./useInput";
import usePersistentState from "./usePersistentState";
import config from "../data/config";

import { useState, useEffect, useRef, RefObject, useMemo } from "react";
import { resumeMusic, fadeOutMusic, stopMusic } from "../utils/audio";
import {
  InternalGameState,
  Player,
  Bullet,
  Enemy,
  Particle,
} from "../types/gameTypes";
import { useGameLogic } from "./useGameLogic";
import { useGameRenderer } from "./useGameRenderer";

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

  const gameStateRef = useRef<InternalGameState>({
    player: {
      x: 240,
      y: 540,
      w: 64 * scaleFactor,
      h: 64 * scaleFactor,
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
    lastShoot: false, // Track previous shoot state for trigger logic
    shake: 0, // Screen shake intensity
    activeCreatureType: 0, // Track current enemy type for background theming
  });

  // Update scale factor when screen size changes
  useEffect(() => {
    gameStateRef.current.scaleFactor = scaleFactor;
    // Update player size when scale changes
    gameStateRef.current.player.w = 64 * scaleFactor;
    gameStateRef.current.player.h = 64 * scaleFactor;
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

  // --- Core Game Hooks ---
  const { update } = useGameLogic(
    gameStateRef,
    settingsRef,
    statsRef,
    inputRef,
    canvasRef,
    setStats,
    setGameOver
  );

  const { draw } = useGameRenderer(canvasRef, gameStateRef);

  // References to stable update/draw functions for the loop
  const updateRef = useRef(update);
  const drawRef = useRef(draw);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    // Only start loop if canvas is ready?
    // Actually the original code just started RequestAnimationFrame loop immediately.

    let last = performance.now();

    function loop(now = performance.now()) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      updateRef.current(dt);
      drawRef.current();

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
      window.removeEventListener("keydown", onKey);
      stopMusic();
    };
  }, []); // Run once on mount

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
        state.player.w = 64 * scale;
        state.player.h = 64 * scale;

        // 4. Reset flags
        state.initialWaveSpawned = false;
        state.gameOver = false;
        state.paused = false;
        state.gameStarted = true;

        // 5. Reset React state
        setGameOver(false);
        setPaused(false);
        setGameStarted(true);
        // Note: Music is handled by useEffect when gameStarted changes
      },
      resetSettings: () =>
        setSettings({
          volume: 0.5,
          difficulty: "normal",
          particles: true,
          muted: false,
        }),
    }),
    [gameOver, settings.muted, setSettings, setStats]
  );

  const state = useMemo(
    () => ({
      ...settings,
      ...stats,
      paused,
      gameOver,
      gameStarted,
      isSmallScreen,
    }),
    [settings, stats, paused, gameOver, gameStarted, isSmallScreen]
  );

  return {
    state,
    actions,
  };
}
