"use client";

import { HUDProps } from "../types/types";

export default function HUD({ state }: HUDProps) {
  return (
    <div className="absolute left-4 top-4 p-2 bg-black/40 rounded-md text-sm">
      <div>Score: {state.score}</div>
      <div>Lives: {state.lives}</div>
      <div>Wave: {state.wave}</div>
    </div>
  );
}
