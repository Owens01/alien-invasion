"use client";

import { useGameStore } from "../hooks/useGameStore"; // Adjust path as needed

export default function GameControls({ onOpenSettings }: { onOpenSettings: () => void }) {
  // Select only the necessary state and actions
  const { paused, settings, togglePause, toggleMute } = useGameStore((state) => ({
    paused: state.paused,
    settings: state.settings,
    togglePause: state.togglePause,
    toggleMute: state.toggleMute,
  }));

  return (
    <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
      <h2 className="font-bold text-xl mb-3 text-white">Controls</h2>
      
      {/* 1. PAUSE / RESUME */}
      <button
        onClick={togglePause}
        className={`w-full py-3 rounded-lg font-bold transition-all mb-3 ${
          paused
            ? "bg-green-600 hover:bg-green-500 text-white"
            : "bg-yellow-600 hover:bg-yellow-500 text-white"
        }`}
      >
        {paused ? "RESUME" : "PAUSE"}
      </button>

      {/* 2. MUTE SFX (Assuming toggleMute handles SFX/Music combined or toggles the main mute) */}
      <button
        onClick={toggleMute}
        className={`w-full py-3 rounded-lg font-medium transition-colors mb-3 border ${
          settings.muted
            ? "bg-red-900/50 border-red-500 text-red-200"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
        }`}
      >
        {settings.muted ? "SFX: OFF" : "Mute SFX"}
      </button>

      {/* 3. MUTE MUSIC */}
      <button
        onClick={toggleMute} // Using the same action for both based on the provided code structure
        className={`w-full py-3 rounded-lg font-medium transition-colors mb-3 border ${
          settings.muted
            ? "bg-red-900/50 border-red-500 text-red-200"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
        }`}
      >
        {settings.muted ? "Music: OFF" : "Mute Music"}
      </button>

      {/* 4. SETTINGS */}
      <button
        onClick={onOpenSettings}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
      >
        SETTINGS
      </button>
    </div>
  );
}