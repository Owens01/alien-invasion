// components/GameControls.tsx

"use client";

import { useGameStore } from "@/app/zustand-store/useGameStore"; // For paused, togglePause
import { useSettingsStore } from "@/app/zustand-store/useSettingsStore"; // For muted, toggleMute

export default function GameControls({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  // 1. Select state and action from the CORE Game Store
  const { paused, togglePause } = useGameStore((state) => ({
    paused: state.paused,
    togglePause: state.togglePause,
  })); // 2. Select state and action from the SETTINGS Store

  const { muted, toggleMute } = useSettingsStore((state) => ({
    muted: state.muted,
    toggleMute: state.toggleMute,
  })); // NOTE: The original component had two separate "Mute" buttons using the same logic. // Since the 'muted' state controls ALL sound (SFX and Music) via the store, // I've kept the first Mute button and commented out the redundant second one for clarity.

  return (
    <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
            <h2 className="font-bold text-xl mb-3 text-white">Controls</h2>     
            {/* 1. PAUSE / RESUME (Uses useGameStore) */}     {" "}
      <button
        onClick={togglePause}
        className={`w-full py-3 rounded-lg font-bold transition-all mb-3 ${
          paused
            ? "bg-green-600 hover:bg-green-500 text-white"
            : "bg-yellow-600 hover:bg-yellow-500 text-white"
        }`}
      >
                {paused ? "RESUME" : "PAUSE"}     {" "}
      </button>
            {/* 2. TOGGLE MUTE (Uses useSettingsStore) */}     {" "}
      <button
        onClick={toggleMute}
        className={`w-full py-3 rounded-lg font-medium transition-colors mb-3 border ${
          muted
            ? "bg-red-900/50 border-red-500 text-red-200"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
        }`}
      >
                {muted ? "UNMUTE ALL" : "MUTE ALL"}     {" "}
      </button>
           {" "}
      {/*       // Redundant button removed as 'muted' controls both SFX and Music
      <button
        onClick={toggleMute} 
        className="..."
      >
        {muted ? "Music: OFF" : "Mute Music"}
      </button>
      */}
            {/* 4. SETTINGS */}     {" "}
      <button
        onClick={onOpenSettings}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
      >
                SETTINGS      {" "}
      </button>
         {" "}
    </div>
  );
}
