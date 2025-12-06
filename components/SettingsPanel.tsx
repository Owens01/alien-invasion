"use client";

import { SettingsPanelProps } from "../types/types";

export default function SettingsPanel({
  state,
  actions,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-[320px] text-white border border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-center">Settings</h3>

        {/* --- Game Controls --- */}
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.volume}
              onChange={(e) => actions.setVolume(Number(e.target.value))}
              className="w-24 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm">Difficulty</span>
            <select
              value={state.difficulty}
              onChange={(e) => actions.setDifficulty(e.target.value)}
              className="bg-slate-700 rounded px-2 py-1 text-sm border border-slate-600 outline-none"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Particles</span>
            <input
              type="checkbox"
              checked={state.particles}
              onChange={(e) => actions.setParticles(e.target.checked)}
              className="cursor-pointer"
            />
          </label>

          {/* Note: Mute toggles are also here for completeness, 
              even though you will have main buttons for them on the right panel. */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Mute Music</span>
            <input
              type="checkbox"
              checked={state.muted}
              onChange={() => actions.toggleMute()}
              className="cursor-pointer"
            />
          </label>
          <div className="flex items-center justify-between bg-slate-700/50 p-1 rounded-lg border border-slate-600 mb-2">
            <span className="text-sm">High Score</span>
            <span className="text-yellow-400 font-mono text-lg">
              {state.highScore}
            </span>
          </div>
        </div>

        {/* --- How to Play Instructions --- */}
        <div className="mt-6 pt-4 border-t border-slate-600">
          <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2 mb-3">
              How to Play
            </h3>

            {/* Desktop Controls */}
            <div className="mb-4">
              <h4 className="text-slate-400 font-medium text-xs uppercase mb-2">
                🖥️ Desktop Controls
              </h4>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  <kbd className="bg-slate-700 px-2 py-1 rounded">←</kbd>{" "}
                  <kbd className="bg-slate-700 px-2 py-1 rounded">→</kbd>{" "}
                  <kbd className="bg-slate-700 px-2 py-1 rounded">↑</kbd>{" "}
                  <kbd className="bg-slate-700 px-2 py-1 rounded">↓</kbd> or{" "}
                  <kbd className="bg-slate-700 px-2 py-1 rounded">WASD</kbd>{" "}
                  Move
                </p>
                <p>
                  <kbd className="bg-slate-700 px-2 py-1 rounded">Space</kbd>{" "}
                  Shoot
                </p>
                <p>
                  <kbd className="bg-slate-700 px-2 py-1 rounded">P</kbd> Pause
                </p>
                <p>
                  <kbd className="bg-slate-700 px-2 py-1 rounded">S</kbd>{" "}
                  Settings
                </p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div>
              <h4 className="text-slate-400 font-medium text-xs uppercase mb-2">
                📱 Mobile Controls
              </h4>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  <span className="bg-slate-700 px-2 py-1 rounded">
                    Touch & Hold
                  </span>{" "}
                  Move in any direction
                </p>
                <p>
                  <span className="bg-slate-700 px-2 py-1 rounded">Tap</span>{" "}
                  Shoot
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={() => {
              actions.resetSettings();
              // Optional: Keep panel open or close it on reset?
              // Usually reset doesn't close, but adhering to existing logic:
              onClose();
            }}
            className="px-4 py-2 rounded bg-red-600/80 hover:bg-red-600 text-sm transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600/80 hover:bg-blue-600 text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
