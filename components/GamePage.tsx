"use client";

import React, { useState } from "react";
import WelcomeScreen from "./WelcomeScreen";
import GameCanvas from "./GameCanvas";

export default function GamePage() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        <WelcomeScreen onStart={() => setStarted(true)} />
      ) : (
        <GameCanvas />
      )}
    </>
  );
}
