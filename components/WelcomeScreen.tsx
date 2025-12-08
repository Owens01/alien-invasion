"use client";

import React from "react";

type WelcomeScreenProps = {
  onStart: () => void;
};

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="w-full h-screen bg-linear-to-br from-slate-900 to-black flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center ">
        Welcome to SpaceStrike {" "}
  <span className="text-xs md:text-sm font-normal text-gray-400">v1.0</span>
      </h1>
      <p className="text-base md:text-lg mb-8 md:mb-12 text-center max-w-xl">
         The fate of the galaxy rests in your hands. Pilot your spacecraft to repel the 
  extraterrestrial threat.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-cyan-400 hover:bg-blue-400 rounded-lg text-xl md:text-2xl font-bold transition-colors shadow-lg shadow-cyan-400/30"
      >
        Start Game
      </button>
    </div>
  );
}
