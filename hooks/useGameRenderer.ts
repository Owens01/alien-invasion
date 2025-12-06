"use client";

import { useRef, useEffect, MutableRefObject } from "react";
import { InternalGameState } from "../types/gameTypes";
import { clamp } from "../utils/clamp";

export function useGameRenderer(
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  gameStateRef: MutableRefObject<InternalGameState>
) {
  const creatureImages = useRef<HTMLImageElement[]>([]);
  const playerShipImage = useRef<HTMLImageElement | null>(null);
  const backgroundImages = useRef<HTMLImageElement[]>([]);
  const imagesLoaded = useRef(false);

  // Load images
  useEffect(() => {
    const loadImages = () => {
      const creaturePromises = [
        "/creature1.png",
        "/creature2.png",
        "/creature3.png",
        "/creature4.png",
      ].map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            creatureImages.current[index] = img;
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
          img.src = src;
        });
      });

      // Load player ship
      const playerPromise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          playerShipImage.current = img;
          resolve();
        };
        img.onerror = () => {
          console.warn("Failed to load player ship");
          resolve();
        };
        img.src = "/player-ship.png";
      });

      // Load backgrounds
      const bgPromises = [
        "/bg_creature_0.png",
        "/bg_creature_1.png",
        "/bg_creature_2.png",
        "/bg_creature_3.png",
      ].map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            backgroundImages.current[index] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load ${src}`);
            resolve();
          };
          img.src = src;
        });
      });

      Promise.all([...creaturePromises, playerPromise, ...bgPromises]).then(
        () => {
          imagesLoaded.current = true;
          console.log("✅ All images loaded");
        }
      );
    };

    loadImages();
  }, []);

  // Resize logic
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!ctx || !canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keep player strictly within bounds on resize
      const p = gameStateRef.current.player;
      p.x = clamp(p.x, 0, rect.width - p.w);
      p.y = clamp(p.y, 0, rect.height - p.h);
    }

    // Initial resize after next paint
    requestAnimationFrame(resize);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, gameStateRef]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    ctx.save();
    // Apply screen shake
    if (state.shake > 0) {
      const dx = (Math.random() - 0.5) * state.shake;
      const dy = (Math.random() - 0.5) * state.shake;
      ctx.translate(dx, dy);
    }

    // Draw player ship
    if (imagesLoaded.current && playerShipImage.current) {
      const img = playerShipImage.current;
      const imgAspect = img.width / img.height;
      const boundsAspect = state.player.w / state.player.h;

      let drawWidth = state.player.w;
      let drawHeight = state.player.h;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > boundsAspect) {
        drawHeight = state.player.w / imgAspect;
        offsetY = (state.player.h - drawHeight) / 2;
      } else {
        drawWidth = state.player.h * imgAspect;
        offsetX = (state.player.w - drawWidth) / 2;
      }

      ctx.drawImage(
        img,
        state.player.x + offsetX,
        state.player.y + offsetY,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(
        state.player.x,
        state.player.y,
        state.player.w,
        state.player.h
      );
    }

    state.bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Draw enemies with creature images
    state.enemies.forEach((e) => {
      if (imagesLoaded.current && creatureImages.current[e.creatureType]) {
        const img = creatureImages.current[e.creatureType];

        // Draw image centered within enemy bounds, preserving aspect ratio
        const imgAspect = img.width / img.height;
        const boundsAspect = e.w / e.h;

        let drawWidth = e.w;
        let drawHeight = e.h;
        let offsetX = 0;
        let offsetY = 0;

        // Fit image to bounds while maintaining aspect ratio
        if (imgAspect > boundsAspect) {
          // Image is wider - fit to width
          drawHeight = e.w / imgAspect;
          offsetY = (e.h - drawHeight) / 2;
        } else {
          // Image is taller - fit to height
          drawWidth = e.h * imgAspect;
          offsetX = (e.w - drawWidth) / 2;
        }

        // Visual feedback for damaged enemies
        const healthPercent = e.health / e.maxHealth;
        ctx.globalAlpha = 0.3 + healthPercent * 0.7; // Range from 0.3 to 1.0

        ctx.drawImage(img, e.x + offsetX, e.y + offsetY, drawWidth, drawHeight);

        ctx.globalAlpha = 1.0; // Reset alpha

        // Draw health number for big enemies if timer is active
        if (e.isBig && e.healthDisplayTimer > 0) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.health.toString(), e.x + e.w / 2, e.y + e.h / 2);
        }
      } else {
        // Fallback to rectangle if images not loaded
        ctx.fillStyle = "#ff4d4f";
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }
    });

    ctx.fillStyle = "#ff8c00";
    state.enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

    ctx.globalCompositeOperation = "lighter";
    state.particles.forEach((p) => {
      ctx.fillStyle = p.color || `rgba(255,200,50,${Math.max(0, p.life)})`;
      // Scale opacity by life
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";

    ctx.restore(); // Restore context after shake
  }

  return { draw };
}
