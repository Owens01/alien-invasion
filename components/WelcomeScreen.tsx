"use client";

import React from "react";

type WelcomeScreenProps = {
  onStart: () => void;
};

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="w-full h-screen bg-linear-to-br from-slate-900 to-black flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-8 text-center pt-10 md:pt-0">
        Welcome to Space Shooter
      </h1>
      <p className="text-base md:text-lg mb-8 md:mb-12 text-center max-w-xl">
        Defend the galaxy from alien invaders! Use the arrow keys to move and
        spacebar to shoot.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 md:px-12 md:py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl md:text-2xl font-bold transition-colors shadow-lg shadow-blue-500/30"
      >
        Start Game
      </button>
    </div>
  );
}
