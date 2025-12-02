"use client";
import { useEffect, useRef, useState } from "react";
import { InputState } from "../types/types";

export default function useInput() {
  const keys = useRef<Record<string, boolean>>({});
  const [state, setState] = useState<InputState>({
    left: false,
    right: false,
    shoot: false,
  });

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        keys.current.right = true;
      if (e.key === " " || e.code === "Space") keys.current.shoot = true;

      setState({
        left: !!keys.current.left,
        right: !!keys.current.right,
        shoot: !!keys.current.shoot,
      });
    }

    function up(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        keys.current.right = false;
      if (e.key === " " || e.code === "Space") keys.current.shoot = false;

      setState({
        left: !!keys.current.left,
        right: !!keys.current.right,
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
