"use client";
import { useState, useEffect } from "react";

export default function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore storage errors (e.g. private mode or full quota)
    }
  }, [key, state]);

  return [state, setState] as const;
}
