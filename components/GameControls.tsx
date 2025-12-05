"use client";

import React from "react";

type GameControlsProps = {
  onOpenSettings: () => void;
  actions: {
    togglePause: () => void;
  };
  state: {
    paused: boolean;
  };
};

export default function GameControls({
  onOpenSettings,
  actions,
  state,
}: GameControlsProps) {
  return (
    <div
      className="
        bg-slate-800 
        rounded-2xl 
        p-2 md:p-4 
        shadow-lg 
        border border-slate-700
        w-full
      "
    >
      <h2 className="font-bold text-xl mb-4 text-white hidden md:block">
        Controls
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
        {/* PAUSE / RESUME */}
        <button
          onClick={actions.togglePause}
          className={`
            w-full py-2 md:py-3 rounded-lg font-bold transition-all text-sm md:text-base
            ${
              state.paused
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-yellow-600 hover:bg-yellow-500 text-white"
            }
          `}
        >
          {state.paused ? "RESUME" : "PAUSE"}
        </button>

        {/* SETTINGS */}
        <button
          onClick={onOpenSettings}
          className="
            w-full py-2 md:py-3 
            rounded-lg 
            bg-blue-600 
            hover:bg-blue-500 
            text-white 
            font-bold 
            text-sm md:text-base
            transition-colors
          "
        >
          SETTINGS
        </button>
      </div>
    </div>
  );
}
