"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HUD from "./HUD";
import SettingsPanel from "./SettingsPanel";
import Controls from "./Controls";
import PauseOverlay from "./PauseOverlay";
import useGame from "../hooks/useGame";
import { playMusic, stopMusic, fadeOutMusic, resumeMusic } from "../utils/audio";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, actions } = useGame(canvasRef);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);

  // // Center canvas initially, shift left when settings open
  // const canvasShift = showSettings ? "translate-x-[-300px]" : "translate-x-0";

  useEffect(() => {
    if (musicStarted) playMusic("theme", 0.4);
  }, [musicStarted]);

  useEffect(() => {
    if (state.paused) fadeOutMusic();
    else if (!showWelcome && !state.paused) resumeMusic();
    if (state.gameOver) fadeOutMusic();
    return () => stopMusic();
  }, [state.paused, state.gameOver, showWelcome]);

  return (
    <div className="relative w-full h-[640px] rounded-xl overflow-hidden bg-black flex justify-center items-center">
      
      {/* Canvas container with shift animation */}
      <motion.div>
        <canvas ref={canvasRef} className="w-[640px] h-[640px] block" />
        <HUD state={state} />
        <div className="absolute bottom-3 left-3">
          <Controls actions={actions} />
        </div>
        {state.paused && <PauseOverlay onResume={() => actions.togglePause()} />}
      </motion.div>

      {/* Right side panel: Pause + Settings */}
      <div className="absolute top-5 right-5 flex flex-col gap-2">
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

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            state={state}
            actions={actions}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Welcome Screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-linear-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center text-center text-white"
          >
            <h1 className="text-5xl font-bold mb-6">🚀 Alien Invasion</h1>
            <p className="text-lg mb-6">Defend your base and survive the alien waves!</p>
            <button
              onClick={() => {
                setShowWelcome(false);
                setMusicStarted(true);
                actions.restart(); // start game
              }}
              className="bg-green-600 px-6 py-3 rounded-lg text-white hover:bg-green-500 shadow-md"
            >
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {state.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="text-lg mb-4">Your Score: {state.score}</p>
            <button
              onClick={() => actions.restart()}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
            >
              Restart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
