"use client";

import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import GameControls from "../components/GameControls";
import SettingsPanel from "../components/SettingsPanel";
import { useSettingsStore } from "@/app/zustand-store/useSettingsStore";

// Dynamic import for the canvas component
const GameCanvas = dynamic(() => import("../components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  // Memoized SETTINGS STATE
  const settingsState = useSettingsStore(state => ({
    volume: state.volume,
    difficulty: state.difficulty,
    particles: state.particles,
    muted: state.muted,
  }));

  // Memoized SETTINGS ACTIONS
  const settingsActions = useMemo(() => ({
    setVolume: useSettingsStore.getState().setVolume,
    setDifficulty: useSettingsStore.getState().setDifficulty,
    setParticles: useSettingsStore.getState().setParticles,
    toggleMute: useSettingsStore.getState().toggleMute,
    resetSettings: useSettingsStore.getState().resetSettings,
  }), []);

  return (
    <main className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* LEFT/CENTER: Game Canvas Area */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-3 shadow-2xl border border-slate-700">
          <GameCanvas />
        </div>

        {/* RIGHT: Control Panel */}
        <div className="space-y-4">
          <GameControls onOpenSettings={() => setShowSettings(true)} />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel
          state={settingsState}
          actions={settingsActions}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
