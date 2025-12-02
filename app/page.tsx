"use client";

import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import GameControls from "../components/GameControls";
import SettingsPanel from "../components/SettingsPanel";
import useGame from "../hooks/useGame";

// Dynamic import for the canvas component
const GameCanvas = dynamic(() => import("../components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // --- Hook provides both state and actions ---
  const { state, actions } = useGame(canvasRef);

  return (
    <main className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* LEFT/CENTER: Game Canvas Area */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-3 shadow-2xl border border-slate-700">
          <GameCanvas canvasRef={canvasRef} />
        </div>

        {/* RIGHT: Control Panel */}
        <div className="space-y-4">
          <GameControls onOpenSettings={() => setShowSettings(true)} actions={actions} state={state} />
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
