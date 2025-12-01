"use client";

import dynamic from "next/dynamic";
import React from "react";

const GameCanvas: React.ComponentType = dynamic(
  () => import("../components/GameCanvas"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <main className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Alien Invasion</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-3 shadow-lg">
          <GameCanvas />
        </div>
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-2xl p-4 shadow-lg">
            <h2 className="font-semibold mb-2">Settings</h2>
            <p className="text-sm text-slate-300">
              Open settings in the canvas (press{" "}
              <span className="font-mono">S</span> or use the Settings button).
            </p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 shadow-lg">
            <h2 className="font-semibold">How to play</h2>
            <ol className="list-decimal list-inside text-slate-300 text-sm">
              <li>Move: Arrow keys or A/D</li>
              <li>Shoot: Space</li>
              <li>Pause: P or Escape</li>
              <li>Settings: S</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
