// hooks/useStatsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- TYPES ---
export type StatsState = {
  score: number;
  lives: number; // Lives is persistent across waves, but reset on restart
  wave: number;
  highScores: number[];
};

export type StatsActions = {
  updateScore: (points: number) => void;
  decrementLives: () => void;
  incrementWave: () => void;
  resetStats: (highScores: number[]) => void;
};

export type StatsStore = StatsState & StatsActions;

export const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      // --- STATE (Default) ---
      score: 0,
      lives: 3,
      wave: 1,
      highScores: [] as number[],

      // --- ACTIONS ---
      updateScore: (points) => set((state) => ({ score: state.score + points })),
      
      decrementLives: () => set((state) => ({ lives: state.lives - 1 })),
      
      incrementWave: () => set((state) => ({ wave: state.wave + 1 })),
      
      resetStats: (highScores) => set({
        score: 0,
        lives: 3,
        wave: 1,
        highScores: highScores,
      }),
    }),
    {
      name: "ai-stats-storage",
    }
  )
);