"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HUD from "./HUD";
import SettingsPanel from "./SettingsPanel";
import Controls from "./Controls";
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
  const [showWelcome, setShowWelcome] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);

  // Handle 'S' key to toggle settings
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "s" || e.key === "S") setShowSettings((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 🎵 Handle background music
  useEffect(() => {
    if (!showWelcome && !musicStarted) {
      playMusic("theme", 0.4); // fade in when game starts
      setMusicStarted(true);
    }

    if (state.paused) fadeOutMusic();
    else if (!showWelcome && !state.paused) resumeMusic();

    if (state.gameOver) fadeOutMusic();

    return () => {
      stopMusic();
    };
  }, [state.paused, state.gameOver, showWelcome, musicStarted]);

  return (
    <div className="relative w-full h-[640px] rounded-xl overflow-hidden bg-black">
      <canvas ref={canvasRef} className="w-full h-full block" />

      <HUD state={state} />

      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => actions.togglePause()}
          className="bg-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-600"
        >
          {state.paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-slate-700 px-3 py-1 rounded-lg text-sm hover:bg-slate-600"
        >
          Settings
        </button>
      </div>

      <div className="absolute bottom-3 left-3">
        <Controls actions={actions} />
      </div>

      {state.paused && <PauseOverlay onResume={() => actions.togglePause()} />}

      {showSettings && (
        <SettingsPanel
          state={state}
          actions={actions}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 🌟 Welcome Screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-linear-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center text-center text-white"
          >
            {/* Subtle moving stars background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ backgroundPositionY: ["0%", "100%"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute inset-0 bg-[url('/stars-bg.png')] opacity-40"
              ></motion.div>
            </div>

            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-5xl font-bold mb-6 drop-shadow-lg z-10"
            >
              🚀 Alien Invasion
            </motion.h1>
            <p className="text-lg mb-6 z-10">
              Defend your base and survive the alien waves!
            </p>
            <button
              onClick={() => {
                setShowWelcome(false);
                playMusic("theme", 0.4);
              }}
              className="bg-green-600 px-6 py-3 rounded-lg text-white hover:bg-green-500 shadow-md z-10"
            >
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💀 Game Over Screen */}
      <AnimatePresence>
        {state.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center text-white"
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
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
              >
                Restart
              </button>
             
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
