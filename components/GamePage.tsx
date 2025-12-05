"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";

import WelcomeScreen from "./WelcomeScreen";
import GameControls from "./GameControls";
import SettingsPanel from "./SettingsPanel";
import { GameState, GameActions } from "../types/game";

// Client-only canvas
const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameActions, setGameActions] = useState<GameActions | null>(null);

  // Callback to receive state and actions from GameCanvas
  const handleGameReady = (state: GameState, actions: GameActions) => {
    setGameState(state);
    setGameActions(actions);
  };

  // Handle start game
  const handleStartGame = () => {
    setHasStarted(true);
    // Start the game loop using the actions from GameCanvas
    gameActions?.startGame();
  };

  return (
    <>
      {/* Welcome Screen - shown/hidden with absolute positioning */}
      {!hasStarted && (
        <div className="fixed inset-0 z-50">
          <WelcomeScreen onStart={handleStartGame} />
        </div>
      )}

      {/* Game UI - always rendered and visible so canvas can initialize */}
      <main className="p-2 md:p-8 w-screen overflow-hidden flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 max-w-7xl mx-auto w-full">
          {/* LEFT/CENTER: Game Canvas */}
          <div className="lg:col-span-2">
            <GameCanvas canvasRef={canvasRef} onGameReady={handleGameReady} />
          </div>

          {/* RIGHT: Controls */}
          {gameState && gameActions && (
            <div className="space-y-4">
              <GameControls
                onOpenSettings={() => {
                  gameActions.setPauseState(true);
                  setShowSettings(true);
                }}
                actions={gameActions}
                state={gameState}
              />
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && gameState && gameActions && (
          <SettingsPanel
            state={{
              volume: gameState.volume,
              difficulty: gameState.difficulty,
              particles: gameState.particles,
              muted: gameState.muted,
              highScore: gameState.highScore,
            }}
            actions={{
              setVolume: gameActions.setVolume,
              setDifficulty: gameActions.setDifficulty,
              setParticles: gameActions.setParticles,
              resetSettings: gameActions.resetSettings,
              toggleMute: gameActions.toggleMute,
            }}
            onClose={() => {
              gameActions.setPauseState(false);
              setShowSettings(false);
            }}
          />
        )}
      </main>
    </>
  );
}
