"use client";

import { useEffect, useRef, useState } from "react";
import { InputState } from "../types/types";

/**
 * Hook to track player input (left, right, shoot)
 * Returns a stable InputState object
 */
export default function useInput() {
  const keys = useRef<InputState>({ left: false, right: false, shoot: false });
  const [state, setState] = useState<InputState>({ ...keys.current });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      let changed = false;

      if (["ArrowLeft", "a", "A"].includes(e.key)) {
        keys.current.left = true;
        changed = true;
      }
      if (["ArrowRight", "d", "D"].includes(e.key)) {
        keys.current.right = true;
        changed = true;
      }
      if (e.key === " " || e.code === "Space") {
        keys.current.shoot = true;
        changed = true;
      }

      if (changed) setState({ ...keys.current });
    };

    const up = (e: KeyboardEvent) => {
      let changed = false;

      if (["ArrowLeft", "a", "A"].includes(e.key)) {
        keys.current.left = false;
        changed = true;
      }
      if (["ArrowRight", "d", "D"].includes(e.key)) {
        keys.current.right = false;
        changed = true;
      }
      if (e.key === " " || e.code === "Space") {
        keys.current.shoot = false;
        changed = true;
      }

      if (changed) setState({ ...keys.current });
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return state;
}
