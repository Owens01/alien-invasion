"use client";

type GameActions = {
  setVolume: (v: number) => void;
  setDifficulty: (d: string) => void;
  setParticles: (b: boolean) => void;
  toggleMute: () => void;
  getMuted: () => boolean;
  togglePause: () => void;
  restart: () => void;
  resetSettings: () => void;
  toggleMusic?: () => void;     // ✅ optional new action
  getMusicMuted?: () => boolean; // ✅ optional getter
  startGame?: () => void;       // ✅ for welcome screen
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
    <div className="bg-black/40 p-2 rounded-md text-sm flex gap-2 items-center">
      {!state?.started ? (
        <button
          onClick={() => actions.startGame?.()}
          className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded-md"
        >
          Start Game
        </button>
      ) : (
        <>
          <button
            onClick={() => actions.restart()}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
          >
            Restart
          </button>
          <button
            onClick={() => actions.togglePause()}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
          >
            {state?.paused ? "Resume" : "Pause"}
          </button>
        </>
      )}

      <button
        onClick={() => actions.toggleMute()}
        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
      >
        {isMuted ? "Unmute SFX" : "Mute SFX"}
      </button>

      {actions.toggleMusic && (
        <button
          onClick={() => actions.toggleMusic?.()}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
        >
          {musicMuted ? "Play Music" : "Mute Music"}
        </button>
      )}
    </div>
  );
}
