"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";

import WelcomeScreen from "./WelcomeScreen";
import GameControls from "./GameControls";
import SettingsPanel from "./SettingsPanel";
import useGame from "../hooks/useGame";

// Dynamic import for the canvas — client-only (same as your original)
const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

export default function GamePage() {
  // Canvas ref (passed into the engine hook and to the canvas)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings modal state (same as original)
  const [showSettings, setShowSettings] = useState(false);

  // Game started flag (controls welcome -> game flow)
  const [hasStarted, setHasStarted] = useState(false);

  // Hook provides both state and actions (exactly as you used them)
  const { state, actions } = useGame(canvasRef);

  // Render welcome screen until the user starts the game
  if (!hasStarted) {
    return <WelcomeScreen onStart={() => setHasStarted(true)} />;
  }

  // After start: render game layout (canvas + controls + settings)
  return (
    <main className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* LEFT/CENTER: Game Canvas Area */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
          <GameCanvas canvasRef={canvasRef} />
        </div>

        {/* RIGHT: Control Panel */}
        <div className="space-y-4">
          <GameControls
            onOpenSettings={() => setShowSettings(true)}
            actions={actions}
            state={state}
          />
        </div>
      </div>

      {/* Settings Modal */}
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
    </main>
  );
}
