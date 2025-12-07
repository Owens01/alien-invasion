"use client";

import React from "react";

type GameControlsProps = {
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  actions: {
    togglePause: () => void;
  };
  state: {
    paused: boolean;
  };
};

export default function GameControls({
  onOpenSettings,
  onOpenHowToPlay,
  actions,
  state,
}: GameControlsProps) {
  return (
    <div
      className="
        bg-slate-800 
        rounded-2xl 
        p-2  
        shadow-lg 
        border border-slate-700
        max-w-80
        max-sm:m-auto
        lg:m-1
        lg:
      "
    >

      <div className="grid grid-cols-3 gap-2 md:gap-3">
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
          {state.paused ? "Resume" : "Pause"}
        </button>

        {/* HOW TO PLAY */}
        <button
          onClick={onOpenHowToPlay}
          className="
            w-full py-2 md:py-3 
            rounded-lg 
            bg-slate-600 
            hover:bg-slate-900 
            text-white 
            font-bold 
            text-sm md:text-base
            transition-colors
          "
        >
          Controls
        </button>

        {/* SETTINGS */}
        <button
          onClick={onOpenSettings}
          className="
            w-full py-2 md:py-3 
            rounded-lg 
            bg-slate-900 
            hover:bg-slate-600 
            text-white 
            font-bold 
            text-sm md:text-base
            transition-colors
          "
        >
          Settings
        </button>
      </div>
    </div>
  );
}
