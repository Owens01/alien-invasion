"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HUD from "./HUD";
import Controls from "./Controls";
import PauseOverlay from "./PauseOverlay";
import SettingsPanel from "./SettingsPanel";
import useGame from "../hooks/useGame";
import { playMusic, stopMusic, fadeOutMusic, resumeMusic } from "../utils/audio";

interface GameCanvasProps {
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
}

export default function GameCanvas({ showSettings, setShowSettings }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, actions } = useGame(canvasRef);
  const [showWelcome, setShowWelcome] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);

  // 🎵 Music handling
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
    <div className="relative w-full h-[640px] flex justify-center items-center overflow-hidden">
      {/* Canvas + HUD */}
      <motion.div
        className="relative"
        animate={{ x: showSettings ? -320 : 0 }} // shift left when settings open
        transition={{ type: "tween", duration: 0.3 }}
      >
        <canvas ref={canvasRef} className="w-[640px] h-[640px] bg-black rounded-xl block" />
        <HUD state={state} />
        <div className="absolute bottom-3 left-3">
          <Controls actions={actions} />
        </div>
        {state.paused && <PauseOverlay onResume={() => actions.togglePause()} />}
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="absolute right-0 top-0 h-full"
          >
            <SettingsPanel
              state={state}
              actions={actions}
              onClose={() => setShowSettings(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-gradient-to-b from-gray-900 via-black to-gray-900"
          >
            <h1 className="text-5xl font-bold mb-6">🚀 Alien Invasion</h1>
            <p className="text-lg mb-6">Defend your base and survive the alien waves!</p>
            <button
              onClick={() => {
                setShowWelcome(false);
                setMusicStarted(true);
                actions.restart();
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
