"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  isLoaded: boolean;
  onEnter: () => void;
}

export default function LoadingScreen({
  isLoaded,
  onEnter,
}: LoadingScreenProps) {
  return (
    <div className="fixed h-screen inset-0 z-50 bg-black flex flex-col items-center justify-center text-cyan-400 font-mono">
      {!isLoaded ? (
        <>
          <motion.div
          // className="w-24 h-24 border-4 border-slate-500 rounded-full border-t-transparent"
          // animate={{ rotate: 360 }}
          // transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className=" text-center text-slate-500 text-sm tracking-widest uppercase"
          >
            Initialising Systems...
          </motion.h2>

          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-slate-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="text-cyan-400 text-xl tracking-[0.2em] uppercase glow-text">
            System Online
          </div>

          <button
            onClick={onEnter}
            className="group relative flex items-center justify-center p-6 rounded-full transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] cursor-pointer"
            aria-label="Initialize Connection"
          >
            {/* Ambient Pulse */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse" />

            {/* Rotating Ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 group-hover:border-cyan-400 transition-colors duration-500" />

            {/* Inner Ring */}
            <div className="absolute inset-2 rounded-full border border-cyan-500/10 group-hover:border-cyan-400/40 transition-colors duration-500" />

            {/* Standard Power Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-cyan-400 group-hover:text-cyan-100 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  );
}
