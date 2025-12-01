"use client";
import React from "react";

interface EnemyProps {
  x: number;
  y: number;
  size?: number;
}

const Enemy: React.FC<EnemyProps> = ({ x, y, size = 36 }) => {
  return (
    <div
      className="absolute bg-red-500 shadow-lg shadow-red-700/40"
      style={{
        left: x,
        top: y,
        width: size,
        height: size * 0.8,
        borderRadius: "8px",
      }}
    />
  );
};

export default Enemy;
