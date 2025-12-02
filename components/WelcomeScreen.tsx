"use client";

import React from "react";

type WelcomeScreenProps = {
  onStart: () => void;
};

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="w-full h-screen bg-linear-to-br from-slate-900 to-black flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold mb-8 text-center">
        Welcome to Space Shooter
      </h1>
      <p className="text-lg mb-12 text-center max-w-xl">
        Defend the galaxy from alien invaders! Use the arrow keys to move and spacebar to shoot.
      </p>
      <button
        onClick={onStart}
        className="px-12 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-2xl font-bold transition-colors"
      >
        Start Game
      </button>
    </div>
  );
}
