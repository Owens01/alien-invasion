"use client";

import dynamic from "next/dynamic";
import React, { useRef, useState, useEffect } from "react";
import { useGameStore } from "../hooks/useGameStore";
import GameControls from "../components/GameControls";
import SettingsPanel from "../components/SettingsPanel";

// GameCanvas component structure remains the same
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
  
  // Select the necessary action from the Zustand store
  const runGameLoop = useGameStore(state => state.runGameLoop);
  const stopGameLoop = useGameStore(state => state.stopGameLoop);

  // Mount/Unmount the game loop
  useEffect(() => {
    // Pass the canvas reference to the store to start the loop
    const cleanup = runGameLoop(canvasRef);
    
    // The cleanup function returned by runGameLoop handles stopping the RAF and listeners
    return cleanup;
  }, [runGameLoop]);

  return (
    <main className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        
        {/* LEFT/CENTER: Game Canvas Area */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-3 shadow-2xl border border-slate-700">
          <GameCanvas 
            canvasRef={canvasRef} 
          />
        </div>
        
        {/* RIGHT: Control Panel */}
        <div className="space-y-4">
          <GameControls onOpenSettings={() => setShowSettings(true)} />
        </div>
      </div>
      
      {/* Settings Modal (It pulls state/actions internally) */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}