"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import useGame from "../hooks/useGame";
import HUD from "./HUD";
import SettingsPanel from "./SettingsPanel";
import PauseOverlay from "./PauseOverlay";

type GameCanvasProps = {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
};

export default function GameCanvas({ canvasRef }: GameCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement | null>(null);
  const ref = canvasRef ?? internalRef;

  const { state, actions } = useGame(ref);
  const [showSettings, setShowSettings] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "s" || e.key === "S") setShowSettings((v) => !v);
      if (e.key === "p" || e.key === "P") actions.togglePause();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto">
      <div className="relative flex-1 w-full h-[80vh] lg:h-[90vh] bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl mx-auto">
        <canvas ref={ref} className="w-full h-full block" />

        <HUD
          state={{
            score: state.score,
            lives: state.lives,
            wave: state.wave,
          }}
        />

        {state.paused && <PauseOverlay onResume={actions.togglePause} />}

        {showSettings && (
          <SettingsPanel
            state={{
              volume: state.volume,
              difficulty: state.difficulty,
              particles: state.particles,
              muted: state.muted,
            }}
            actions={{
              setVolume: actions.setVolume,
              setDifficulty: actions.setDifficulty,
              setParticles: actions.setParticles,
              toggleMute: actions.toggleMute,
              resetSettings: actions.resetSettings,
            }}
            onClose={() => setShowSettings(false)}
          />
        )}

        <AnimatePresence>
          {state.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20"
            >
              <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-bold mb-4"
              >
                Game Over
              </motion.h2>

              <p className="text-lg mb-6">Your Score: {state.score}</p>

              <button
                onClick={actions.restart}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold"
              >
                Restart
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
