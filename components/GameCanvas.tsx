"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import useGame from "../hooks/useGame";        // ✅ your new custom engine
import HUD from "./HUD";
import Controls from "./Controls";
import SettingsPanel from "./SettingsPanel";
import PauseOverlay from "./PauseOverlay";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 🔥 NEW ENGINE HOOK — this replaces ALL Zustand
  const { state, actions } = useGame(canvasRef);

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
    <div
      className="
        w-full
        flex flex-col lg:flex-row
        gap-6
        p-4
        max-w-[1600px]
        mx-auto
      "
    >
      {/* 🎮 GAME CANVAS AREA */}
      <div
        className="
          relative
          flex-1
          w-full
          aspect-[4/3]
          max-h-[80vh]
          bg-slate-900
          border-2 border-slate-700
          rounded-xl
          overflow-hidden
          shadow-2xl
          mx-auto
        "
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* HUD */}
        <HUD
          state={{
            score: state.score,
            lives: state.lives,
            wave: state.wave,
          }}
        />

        {/* Pause Overlay */}
        {state.paused && <PauseOverlay onResume={actions.togglePause} />}

        {/* Settings Panel */}
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

        {/* Game Over */}
        <AnimatePresence>
          {state.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                absolute inset-0
                bg-black/80
                flex flex-col items-center justify-center
                text-white
                z-20
              "
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
                className="
                  px-6 py-3
                  bg-blue-600 hover:bg-blue-500
                  rounded-lg font-bold
                "
              >
                Restart
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🕹️ RIGHT SIDE CONTROL PANEL */}
      <div
        className="
          w-full lg:w-64
          flex flex-col
          gap-4
          mx-auto
        "
      >
        <Controls actions={actions} state={state} />

        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2 mb-3">
            How to Play
          </h3>
          <div className="text-slate-300 text-sm space-y-2">
            <p>
              <kbd className="bg-slate-700 px-2 py-1 rounded">←</kbd>{" "}
              <kbd className="bg-slate-700 px-2 py-1 rounded">→</kbd> Move
            </p>
            <p>
              <kbd className="bg-slate-700 px-2 py-1 rounded">Space</kbd> Shoot
            </p>
            <p>
              <kbd className="bg-slate-700 px-2 py-1 rounded">P</kbd> Pause
            </p>
            <p>
              <kbd className="bg-slate-700 px-2 py-1 rounded">S</kbd> Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
