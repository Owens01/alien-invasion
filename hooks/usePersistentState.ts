"use client";

import { useState, useEffect } from "react";

/**
 * Persistent state hook that syncs with localStorage.
 * Safe for Next.js hydration (doesn’t access localStorage on the server)
 */
export default function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  // Hydration-safe initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  // Sync changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [key, state]);

  return [state, setState] as const;
}
