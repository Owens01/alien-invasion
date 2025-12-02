"use client";

import React from "react";

type GameControlsProps = {
  onOpenSettings: () => void;
  actions: {
    togglePause: () => void;
    toggleMute: () => void;
  };
  state: {
    paused: boolean;
    muted: boolean;
  };
};

export default function GameControls({ onOpenSettings, actions, state }: GameControlsProps) {
  return (
    <div
      className="
        bg-slate-800 
        rounded-2xl 
        p-4 
        shadow-lg 
        border border-slate-700
        w-full
      "
    >
      <h2 className="font-bold text-xl mb-4 text-white">Controls</h2>

      {/* PAUSE / RESUME */}
      <button
        onClick={actions.togglePause}
        className={`
          w-full py-3 rounded-lg font-bold transition-all mb-3
          ${state.paused
            ? "bg-green-600 hover:bg-green-500 text-white"
            : "bg-yellow-600 hover:bg-yellow-500 text-white"}
        `}
      >
        {state.paused ? "RESUME" : "PAUSE"}
      </button>

      {/* MUTE / UNMUTE */}
      <button
        onClick={actions.toggleMute}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors mb-3 border
          ${state.muted
            ? "bg-red-900/50 border-red-500 text-red-200"
            : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"}
        `}
      >
        {state.muted ? "UNMUTE ALL" : "MUTE ALL"}
      </button>

      {/* SETTINGS */}
      <button
        onClick={onOpenSettings}
        className="
          w-full py-3 
          rounded-lg 
          bg-blue-600 
          hover:bg-blue-500 
          text-white 
          font-bold 
          transition-colors
        "
      >
        SETTINGS
      </button>
    </div>
  );
}
