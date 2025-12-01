"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import SettingsPanel from "../components/SettingsPanel";

const GameCanvas: React.ComponentType<any> = dynamic(
  () => import("../components/GameCanvas"),
  { ssr: false }
);

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="p-4 md:p-8">
      <div className="flex gap-4">
        {/* GameCanvas container */}
        <div
          className={`transition-all duration-300 ${
            showSettings ? "-translate-x-64" : "translate-x-0"
          } flex-shrink-0`}
        >
          <GameCanvas showSettings={showSettings} setShowSettings={setShowSettings} />
        </div>

        {/* Settings panel slides in on the right */}
        {showSettings && (
          <div className="flex-shrink-0">
            <SettingsPanel
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
