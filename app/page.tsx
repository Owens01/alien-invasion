"use client";

import dynamic from "next/dynamic";
import React, { useRef } from "react";
import SettingsPanel from "../components/SettingsPanel";
import useSettingsPanel from "../hooks/useSettingsPanel";
import useGame from "../hooks/useGame";

type GameCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  showSettings: boolean;
  setShowSettings: () => void;
};

const GameCanvas = dynamic<GameCanvasProps>(
  () => import("../components/GameCanvas"),
  { ssr: false }
);

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, actions } = useGame(canvasRef);
  const { showSettings, closeSettings, toggleSettings } = useSettingsPanel();

  return (
    <main className="p-4 md:p-8">
      <div className="flex gap-4">
        {/* GameCanvas container */}
        <div
          className={`transition-all duration-300 ${
            showSettings ? "-translate-x-64" : "translate-x-0"
          } shrink-0`}
        >
          <GameCanvas
            canvasRef={canvasRef}
            showSettings={showSettings}
            setShowSettings={toggleSettings}
          />
        </div>

        {/* Settings panel slides in on the right */}
        {showSettings && (
          <div className="shrink-0">
            <SettingsPanel
              state={state}
              actions={actions}
              onClose={closeSettings}
            />
          </div>
        )}
      </div>
    </main>
  );
}
