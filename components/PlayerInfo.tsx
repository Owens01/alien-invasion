"use client";
import React from "react";

interface PlayerInfoProps {
  score: number;
  wave: number;
  lives: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ score, wave, lives }) => {
  return (
    <div className="flex justify-between text-white text-sm md:text-base font-mono px-4 py-2">
      <div>Score: {score}</div>
      <div>Wave: {wave}</div>
      <div>Lives: {lives}</div>
    </div>
  );
};

export default PlayerInfo;
