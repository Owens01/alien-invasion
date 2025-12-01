"use client";

import { SettingsPanelProps } from "../types/types";

export default function SettingsPanel({
  state,
  actions,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-[420px]">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>

        <label className="flex items-center justify-between mb-2">
          <span>Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={state.volume}
            onChange={(e) => actions.setVolume(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center justify-between mb-2">
          <span>Difficulty</span>
          <select
            value={state.difficulty}
            onChange={(e) => actions.setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="flex items-center justify-between mb-2">
          <span>Particles</span>
          <input
            type="checkbox"
            checked={state.particles}
            onChange={(e) => actions.setParticles(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between mb-2">
          <span>Sound</span>
          <input
            type="checkbox"
            checked={!state.muted}
            onChange={() => actions.toggleMute()}
          />
        </label>

        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={() => {
              actions.resetSettings();
              onClose();
            }}
            className="px-3 py-1 rounded bg-slate-700"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
