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
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-cyan-400 font-mono">
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
          className="flex flex-col items-center gap-6"
        >
          <div className="text-cyan-400 text-xl tracking-[0.2em] uppercase glow-text">
            System Online
          </div>

          <button
            onClick={onEnter}
            className="group relative px-8 py-3 bg-transparent overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full border border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300" />
            <div className="absolute inset-0 w-0 h-full bg-cyan-500/20 group-hover:w-full transition-all duration-300 ease-out" />
            <span className="relative text-cyan-400 group-hover:text-cyan-300 tracking-widest text-sm uppercase font-bold">
              Initialize Connection
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
