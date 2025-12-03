"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";

import WelcomeScreen from "./WelcomeScreen";
import GameControls from "./GameControls";
import SettingsPanel from "./SettingsPanel";
import useGame from "../hooks/useGame";

// Client-only canvas
const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Hook provides state + actions
  const { state, actions } = useGame(canvasRef);

  // Handle start game
  const handleStartGame = () => {
    setHasStarted(true);
    actions.startGame(); // ✅ starts the game loop
  };

  if (!hasStarted) {
    return <WelcomeScreen onStart={handleStartGame} />;
  }

  return (
    <main className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* LEFT/CENTER: Game Canvas */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
          <GameCanvas canvasRef={canvasRef} />
        </div>

        {/* RIGHT: Controls */}
        <div className="space-y-4">
          <GameControls
            onOpenSettings={() => setShowSettings(true)}
            actions={actions}
            state={state}
          />
        </div>
      </div>

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
    </main>
  );
}
