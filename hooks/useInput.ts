"use client";
import { useEffect, useRef, useState } from "react";
import { InputState } from "../types/types";

export default function useInput() {
  const keys = useRef<Record<string, boolean>>({});
  const touchState = useRef({
    isActive: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
  });

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

      updateState();
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

      updateState();
    }

    // Touch event handlers
    function touchStart(e: TouchEvent) {
      const touch = e.touches[0];
      touchState.current = {
        isActive: true,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: touch.clientX,
        currentY: touch.clientY,
      };
    }

    function touchMove(e: TouchEvent) {
      if (!touchState.current.isActive) return;

      const touch = e.touches[0];
      touchState.current.currentX = touch.clientX;
      touchState.current.currentY = touch.clientY;

      // Calculate direction based on touch position relative to start
      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;
      const threshold = 20; // Minimum distance to register direction

      // Set directional states based on touch movement
      keys.current.left = deltaX < -threshold;
      keys.current.right = deltaX > threshold;
      keys.current.up = deltaY < -threshold;
      keys.current.down = deltaY > threshold;

      updateState();
    }

    function touchEnd(e: TouchEvent) {
      if (!touchState.current.isActive) return;

      const duration = Date.now() - touchState.current.startTime;
      const deltaX = touchState.current.currentX - touchState.current.startX;
      const deltaY = touchState.current.currentY - touchState.current.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Tap detection: short duration and minimal movement
      if (duration < 200 && distance < 20) {
        keys.current.shoot = true;
        updateState();
        // Auto-release shoot after a short delay
        setTimeout(() => {
          keys.current.shoot = false;
          updateState();
        }, 100);
      }

      // Reset touch directional states
      keys.current.left = false;
      keys.current.right = false;
      keys.current.up = false;
      keys.current.down = false;

      touchState.current.isActive = false;
      updateState();
    }

    function updateState() {
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
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
    };
  }, []);

  return state;
}
