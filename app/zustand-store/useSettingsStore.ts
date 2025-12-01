// hooks/useSettingsStore.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fadeOutMusic, playMusic } from "../utils/audio"; // Import audio utilities

// --- TYPES ---
export type SettingsState = {
  volume: number;
  difficulty: string;
  particles: boolean;
  muted: boolean;
};

export type SettingsActions = {
  setVolume: (v: number) => void;
  setDifficulty: (d: string) => void;
  setParticles: (b: boolean) => void;
  toggleMute: () => void;
  resetSettings: () => void;
};

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // --- STATE (Default) ---
      volume: 0.5,
      difficulty: "normal",
      particles: true,
      muted: false,

      // --- ACTIONS ---
      setVolume: (v) => set({ volume: v }),
      setDifficulty: (d) => set({ difficulty: d }),
      setParticles: (b) => set({ particles: b }),

      toggleMute: () => set((state) => {
        const newMuted = !state.muted;
        
        // NOTE: Music control should ideally check GameStore for game status,
        // but for simplicity in this store, we apply the mute change instantly.
        // The GameLoopStore handles music when the game state changes (pause/start).
        if (newMuted) fadeOutMusic();

        return { muted: newMuted };
      }),
      
      resetSettings: () => set({
        volume: 0.5,
        difficulty: "normal",
        particles: true,
        muted: false,
      }),
    }),
    {
      name: "ai-settings-storage",
      // Only persist the settings themselves
      partialize: (state) => state,
    }
  )
);