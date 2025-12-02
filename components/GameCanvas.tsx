"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HUD from "./HUD";
import SettingsPanel from "./SettingsPanel";
import PauseOverlay from "./PauseOverlay";

//  NEW: Import the three Zustand stores
import { useGameStore } from "@/app/zustand-store/useGameStore";
import { useSettingsStore } from "@/app/zustand-store/useSettingsStore";
import { useStatsStore } from "@/app/zustand-store/useStatsStore";
import useInput from "../hooks/useInput"; // Import the input hook

import {
  playMusic,
  stopMusic,
  fadeOutMusic,
  resumeMusic,
} from "../utils/audio";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  //  NEW: Get input state for the game loop
  const currentInput = useInput();
  
  //  NEW: Access stores separately
  const { paused, gameOver, gameStarted, togglePause, startGame, restart, runGameLoop, stopGameLoop } = useGameStore();
  const { muted, volume, difficulty, particles, toggleMute, setVolume, setDifficulty, setParticles, resetSettings } = useSettingsStore();
  const { score, lives, wave } = useStatsStore();
  
  const [showSettings, setShowSettings] = useState(false);
  
  // Handle 'S' key to toggle settings, 'P' for pause
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "s" || e.key === "S") setShowSettings((v) => !v);
      if (e.key === "p" || e.key === "P") togglePause();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause]);

  // 🎵 Handle background music
  useEffect(() => {
    // Try to play music on mount
    if (!muted) playMusic("theme", volume);
  }, [muted, volume]);

  useEffect(() => {
    if (paused) {
      fadeOutMusic();
    } else if (gameStarted && !muted) {
      resumeMusic(volume);
    }

    if (gameOver) fadeOutMusic();

    return () => stopMusic();
  }, [paused, gameOver, gameStarted, muted, volume]);

  //  NEW: Start game loop with input state
  useEffect(() => {
    if (!gameStarted) {
      startGame();
    }
    
    // Start the game loop, passing canvas ref and current input
    const cleanup = runGameLoop(canvasRef, currentInput);
    
    return () => {
      cleanup();
      stopGameLoop();
    };
  }, [gameStarted, startGame, runGameLoop, stopGameLoop, currentInput]);

  return (
    <div className="flex w-full max-w-6xl mx-auto gap-6 p-4">
      {/* 🎮 Left Side: Game Canvas */}
      <div className="relative flex-1 aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/*  FIXED: Pass only the stats that HUD expects */}
        <HUD 
          state={{ 
            score, 
            lives, 
            wave
          }} 
        />

        {/* Paused Overlay */}
        {paused && <PauseOverlay onResume={togglePause} />}

        {/* Settings Modal -  FIXED: Pass state and actions */}
        {showSettings && (
          <SettingsPanel
            state={{
              volume,
              difficulty,
              particles,
              muted
            }}
            actions={{
              setVolume,
              setDifficulty,
              setParticles,
              toggleMute,
              resetSettings
            }}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* 💀 Game Over Screen */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center text-white z-20"
            >
              <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-4"
              >
                Game Over
              </motion.h2>
              <p className="text-lg mb-4">Your Score: {score}</p>
              <div className="flex gap-4">
                <button
                  onClick={restart}
                  className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 font-bold transition-colors"
                >
                  Restart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🕹️ Right Side: Control Panel */}
      <div className="w-64 flex flex-col gap-4">
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col gap-3">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2 mb-1">
            Controls
          </h3>
          
          {/* 1. Pause Button */}
          <button
            onClick={togglePause}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              paused
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-yellow-600 hover:bg-yellow-500 text-white"
            }`}
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>

          {/* 2. Mute SFX/Music Toggle */}
          <button
            onClick={toggleMute}
            className={`w-full py-3 rounded-lg font-medium transition-colors border ${
              muted
                ? "bg-red-900/50 border-red-500 text-red-200"
                : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
            }`}
          >
            {muted ? "Audio: OFF" : "Mute Audio"}
          </button>

          {/* 3. Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors mt-2"
          >
            SETTINGS
          </button>
        </div>

        {/* Instructions Panel */}
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2 mb-3">
            How to Play
          </h3>
          <div className="text-slate-300 text-sm space-y-2">
            <p><kbd className="bg-slate-700 px-2 py-1 rounded">←</kbd> <kbd className="bg-slate-700 px-2 py-1 rounded">→</kbd> Move</p>
            <p><kbd className="bg-slate-700 px-2 py-1 rounded">Space</kbd> Shoot</p>
            <p><kbd className="bg-slate-700 px-2 py-1 rounded">P</kbd> Pause</p>
            <p><kbd className="bg-slate-700 px-2 py-1 rounded">S</kbd> Settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}