"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HUD from "./HUD";
import SettingsPanel from "./SettingsPanel";
// import Controls from "./Controls"; // Removed as requested
import PauseOverlay from "./PauseOverlay";
import useGame from "../hooks/useGame";
import {
  playMusic,
  stopMusic,
  fadeOutMusic,
  resumeMusic,
} from "../utils/audio";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, actions } = useGame(canvasRef);
  const [showSettings, setShowSettings] = useState(false);
  
  // Removed explicit showWelcome state as "Start Game" button is removed
  // We will auto-start the game logic, but audio might need a click interaction on the page later
  
  // Handle 'S' key to toggle settings, 'P' for pause
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "s" || e.key === "S") setShowSettings((v) => !v);
      if (e.key === "p" || e.key === "P") actions.togglePause();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions]);

  // 🎵 Handle background music
  useEffect(() => {
    // Try to play music on mount (might be blocked by browser autoplay policy until user interacts)
    playMusic("theme", 0.4);
  }, []);

  useEffect(() => {
    if (state.paused) {
      fadeOutMusic();
    } else {
      resumeMusic();
    }

    if (state.gameOver) fadeOutMusic();

    return () => stopMusic();
  }, [state.paused, state.gameOver]);

  // Auto-start game on mount since Start Button is removed
  useEffect(() => {
    actions.startGame();
  }, []);

  return (
    <div className="flex w-full max-w-6xl mx-auto gap-6 p-4">
      {/* 🎮 Left Side: Game Canvas */}
      <div className="relative flex-1 aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl">
        {/* Canvas Background Fix: bg-slate-900 matches deep blue theme better than black */}
        <canvas ref={canvasRef} className="w-full h-full block" />

        <HUD state={state} />

        {/* Note: Overlay Buttons (Pause/Settings) removed from here */}
        {/* Note: Bottom Controls removed from here */}

        {/* Paused Overlay */}
        {state.paused && <PauseOverlay onResume={() => actions.togglePause()} />}

        {/* Settings Modal (Overlaying the canvas) */}
        {showSettings && (
          <SettingsPanel
            state={state}
            actions={actions}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* 💀 Game Over Screen */}
        <AnimatePresence>
          {state.gameOver && (
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
              <p className="text-lg mb-4">Your Score: {state.score}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => actions.restart()}
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
      {/* This replaces the old Settings/Instructions text */}
      <div className="w-64 flex flex-col gap-4">
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col gap-3">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2 mb-1">
            Controls
          </h3>
          
          {/* 1. Pause Button */}
          <button
            onClick={() => actions.togglePause()}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              state.paused
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-yellow-600 hover:bg-yellow-500 text-white"
            }`}
          >
            {state.paused ? "RESUME" : "PAUSE"}
          </button>

          {/* 2. Mute SFX (Bottom) */}
          <button
            onClick={() => actions.toggleMute()} 
            // Note: Assuming single toggleMute for now based on previous file. 
            // If you separate SFX/Music in actions, change this line.
            className={`w-full py-3 rounded-lg font-medium transition-colors border ${
              state.muted
                ? "bg-red-900/50 border-red-500 text-red-200"
                : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
            }`}
          >
            {state.muted ? "SFX: OFF" : "Mute SFX"}
          </button>

          {/* 3. Mute Music */}
          <button
            onClick={() => actions.toggleMute()}
            className={`w-full py-3 rounded-lg font-medium transition-colors border ${
              state.muted
                ? "bg-red-900/50 border-red-500 text-red-200"
                : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
            }`}
          >
            {state.muted ? "Music: OFF" : "Mute Music"}
          </button>

          {/* 4. Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors mt-2"
          >
            SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}