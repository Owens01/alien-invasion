"use client";

import React from "react";

type GameActions = {
  setVolume: (v: number) => void;
  setDifficulty: (d: string) => void;
  setParticles: (b: boolean) => void;
  toggleMute: () => void;
  getMuted: () => boolean;
  togglePause: () => void;
  restart: () => void;
  resetSettings: () => void;

  // optional game-engine features
  toggleMusic?: () => void;
  getMusicMuted?: () => boolean;
  startGame?: () => void;
};

type GameState = {
  started?: boolean;
  paused?: boolean;
};

type ControlsProps = {
  actions: GameActions;
  state?: GameState;
};

export default function Controls({ actions, state }: ControlsProps) {
  const isMuted = actions.getMuted?.() ?? false;
  const musicMuted = actions.getMusicMuted?.() ?? false;

  return (
    <div
      className="
        w-full 
        max-w-[900px]
        mx-auto
        mt-4
        bg-black/40 
        backdrop-blur-md
        rounded-xl 
        p-3 
        flex 
        flex-col 
        sm:flex-row 
        sm:items-center 
        sm:justify-center
        gap-3
        text-sm
        text-white
      "
    >
      {/* Start / Restart / Pause */}
      <div className="flex flex-wrap gap-2 justify-center">
        {!state?.started ? (
          <button
            onClick={() => actions.startGame?.()}
            className="
              px-4 py-2 
              bg-green-700 hover:bg-green-600 
              rounded-lg 
              w-full sm:w-auto 
              text-center
              transition
            "
          >
            Start Game
          </button>
        ) : (
          <>
            <button
              onClick={() => actions.restart()}
              className="
                px-4 py-2 
                bg-slate-700 hover:bg-slate-600 
                rounded-lg 
                transition
              "
            >
              Restart
            </button>

            <button
              onClick={() => actions.togglePause()}
              className="
                px-4 py-2 
                bg-slate-700 hover:bg-slate-600 
                rounded-lg 
                transition
              "
            >
              {state?.paused ? "Resume" : "Pause"}
            </button>
          </>
        )}
      </div>

      {/* Sound + Music */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => actions.toggleMute()}
          className="
            px-4 py-2 
            bg-slate-700 hover:bg-slate-600 
            rounded-lg 
            transition
          "
        >
          {isMuted ? "Unmute SFX" : "Mute SFX"}
        </button>

        {actions.toggleMusic && (
          <button
            onClick={() => actions.toggleMusic?.()}
            className="
              px-4 py-2 
              bg-slate-700 hover:bg-slate-600 
              rounded-lg 
              transition
            "
          >
            {musicMuted ? "Play Music" : "Mute Music"}
          </button>
        )}
      </div>
    </div>
  );
}
