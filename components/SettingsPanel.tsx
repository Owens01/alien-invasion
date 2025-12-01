"use client";

import { SettingsPanelProps } from "../types/types";

export default function SettingsPanel({ state, actions, onClose }: SettingsPanelProps) {
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
            <input type="checkbox" checked={state.muted} onChange={() => actions.toggleMute()} className="cursor-pointer" />
          </label>
        </div>

        {/* --- How to Play Instructions --- */}
        <div className="mt-6 pt-4 border-t border-slate-600">
          <h4 className="font-semibold mb-2 text-slate-300">How to Play</h4>
          <ul className="text-xs space-y-1 text-slate-400">
            <li>1. Move: Arrow keys or A/D</li>
            <li>2. Shoot: Space</li>
            <li>3. Pause: P or Escape</li>
            <li>4. Settings: S</li>
          </ul>
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