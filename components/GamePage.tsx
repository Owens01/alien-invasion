"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";

import WelcomeScreen from "./WelcomeScreen";
import GameControls from "./GameControls";
import SettingsPanel from "./SettingsPanel";
import HowToPlayPanel from "./HowToPlayPanel";
import { GameState, GameActions } from "../types/game";

import {
  playWelcomeMusic,
  fadeOutWelcomeMusic,
  playMusic,
} from "../utils/audio";
import LoadingScreen from "./LoadingScreen";

// Client-only canvas
const GameCanvas = dynamic(() => import("./GameCanvas"), { ssr: false });

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameActions, setGameActions] = useState<GameActions | null>(null);

  // Callback to receive state and actions from GameCanvas
  const handleGameReady = (state: GameState, actions: GameActions) => {
    setGameState(state);
    setGameActions(actions);
  };

  // Effect to play welcome music when user enters
  React.useEffect(() => {
    if (hasEntered && !hasStarted) {
      playWelcomeMusic(0.5);
    }
  }, [hasEntered, hasStarted]);

  // Handle start game
  const handleStartGame = () => {
    setHasStarted(true);
    fadeOutWelcomeMusic(1000);
    setTimeout(() => {
      // Start game music after fade out handled by toggleMusic or manual play
      // Actually start game triggers gameStarted which triggers useGame logic
    }, 1000);
    // Start the game loop using the actions from GameCanvas
    gameActions?.startGame();
  };

  return (
    <>
      {/* Loading / Entry Screen */}
      {!hasEntered && (
        <LoadingScreen
          isLoaded={gameState ? !gameState.isLoading : false}
          onEnter={() => setHasEntered(true)}
        />
      )}

      {/* Welcome Screen - shown/hidden with absolute positioning */}
      {hasEntered && !hasStarted && (
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
                onOpenHowToPlay={() => {
                  gameActions.setPauseState(true);
                  setShowHowToPlay(true);
                }}
                actions={gameActions}
                state={gameState}
              />
              <p className="max-sm:text-center text-xs text-slate-500">Designed by OwenVisuals</p>
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

        {/* How to Play Panel */}
        {showHowToPlay && gameActions && (
          <HowToPlayPanel
            onClose={() => {
              gameActions.setPauseState(false);
              setShowHowToPlay(false);
            }}
          />
        )}
      </main>
    </>
  );
}
