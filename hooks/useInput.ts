"use client";
import { useEffect, useRef, useState } from "react";
import { InputState } from "../types/types";

export default function useInput() {
  const keys = useRef<Record<string, boolean>>({});
  const [state, setState] = useState<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
  });

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        keys.current.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
        keys.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
        keys.current.down = true;
      if (e.key === " " || e.code === "Space") keys.current.shoot = true;

      setState({
        left: !!keys.current.left,
        right: !!keys.current.right,
        up: !!keys.current.up,
        down: !!keys.current.down,
        shoot: !!keys.current.shoot,
      });
    }

    function up(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        keys.current.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
        keys.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
        keys.current.down = false;
      if (e.key === " " || e.code === "Space") keys.current.shoot = false;

      setState({
        left: !!keys.current.left,
        right: !!keys.current.right,
        up: !!keys.current.up,
        down: !!keys.current.down,
        shoot: !!keys.current.shoot,
      });
    }

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return state;
}
