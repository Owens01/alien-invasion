"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to run a callback on every animation frame.
 * @param callback Function to run every frame, receives delta time (dt) in seconds.
 * @param active Whether the animation loop is active. Defaults to true.
 */
export default function useAnimationFrame(
  callback: (dt: number) => void,
  active = true
) {
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // Wrap callback in useCallback to avoid unnecessary re-subscriptions
  const frameCallback = useCallback(
    (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      callback(dt);
      rafRef.current = requestAnimationFrame(frameCallback);
    },
    [callback]
  );

  useEffect(() => {
    if (!active) return;

    rafRef.current = requestAnimationFrame(frameCallback);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [active, frameCallback]);
}
