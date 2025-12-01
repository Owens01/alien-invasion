"use client";

import dynamic from "next/dynamic";
import React, { useRef, useState, useEffect } from "react";
import { useGameStore } from "../hooks/useGameStore"; // New Zustand Store Import
import GameControls from "../components/GameControls"; // New Controls Component Import
import SettingsPanel from "../components/SettingsPanel"; // Settings Panel is still managed here

// We no longer need to pass state/actions to GameCanvas dynamically, 
// but we still need the canvasRef for the game loop
interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const GameCanvas: React.ComponentType<GameCanvasProps> = dynamic(
  () => import("../components/GameCanvas"),
  {
    ssr: false,
  }
);

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Use the Zustand action to start the game loop when the component mounts
  const runGameLoop = useGameStore(state => state.runGameLoop);
  const startGame = useGameStore(state => state.startGame);
  
  // Start the game loop on mount and stop it on unmount
  useEffect(() => {
    // Run the loop function from the store, passing the canvasRef
    const cleanup = runGameLoop(canvasRef);
    
    // We must ensure the game starts (e.g., to handle the first key press/click)
    startGame(); 
    
    return () => {
      // The store handles most cleanup, but return the function just in case
      // stopGameLoop() is another option if defined in the store.
      if (cleanup) cleanup();
    };
  }, [runGameLoop, startGame]);


  return (
    <main className="p-4 md:p-8">
      {/* Container Grid: 1 column on small screens, 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        
        {/* LEFT/CENTER (2/3 width on desktop): Game Canvas Area */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-3 shadow-2xl border border-slate-700">
          {/* GameCanvas is now simpler, only needs the Ref */}
          <GameCanvas 
            canvasRef={canvasRef} 
          />
        </div>
        
        {/* RIGHT (1/3 width on desktop): Control Panel */}
        <div className="space-y-4">
          {/* Use the new Controls Component */}
          <GameControls onOpenSettings={() => setShowSettings(true)} />
        </div>
      </div>
      
      {/* Settings Modal (It will pull state/actions directly from useGameStore) */}
      {showSettings && (
        <SettingsPanel
          // SettingsPanel now pulls state/actions internally, 
          // or is modified to pull them as we planned in the previous step (passing state/actions)
          // For simplicity, we'll assume SettingsPanel is now modified to use useGameStore internally
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}