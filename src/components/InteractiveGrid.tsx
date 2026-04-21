"use client";

import { useEffect, useRef } from "react";

export default function InteractiveGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let trailX = 0;
    let trailY = 0;
    let targetX = 0;
    let targetY = 0;
    let frameId: number;

    const update = () => {
      // Main cursor - snappy
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      // Trail - slower lerp = longer tail
      trailX += (targetX - trailX) * 0.04;
      trailY += (targetY - trailY) * 0.04;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--x", `${currentX}px`);
        containerRef.current.style.setProperty("--y", `${currentY}px`);
        containerRef.current.style.setProperty("--tx", `${trailX}px`);
        containerRef.current.style.setProperty("--ty", `${trailY}px`);
      }
      frameId = requestAnimationFrame(update);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-background pointer-events-none"
    >
      {/* Base Static Grid - darker gray for visibility */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px), 
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }}
      />

      {/* Trail layer - large elongated ellipse, follows slowly */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #93c5fd 1.5px, transparent 1.5px), 
            linear-gradient(to bottom, #93c5fd 1.5px, transparent 1.5px)
          `,
          backgroundSize: "40px 40px",
          maskImage: `radial-gradient(180px 70px ellipse at var(--tx, -1000px) var(--ty, -1000px), black 5%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(180px 70px ellipse at var(--tx, -1000px) var(--ty, -1000px), black 5%, transparent 70%)`,
        }}
      />

      {/* Main focused grid - smaller ellipse, tighter */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3b82f6 1.5px, transparent 1.5px), 
            linear-gradient(to bottom, #3b82f6 1.5px, transparent 1.5px)
          `,
          backgroundSize: "40px 40px",
          maskImage: `radial-gradient(90px 50px ellipse at var(--x, -1000px) var(--y, -1000px), black 15%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(90px 50px ellipse at var(--x, -1000px) var(--y, -1000px), black 15%, transparent 100%)`,
        }}
      />

      {/* Sharp core - very tight ellipse */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2563eb 2px, transparent 2px), 
            linear-gradient(to bottom, #2563eb 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px",
          maskImage: `radial-gradient(45px 25px ellipse at var(--x, -1000px) var(--y, -1000px), black 30%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(45px 25px ellipse at var(--x, -1000px) var(--y, -1000px), black 30%, transparent 100%)`,
        }}
      />

      {/* Soft glow spot - flattened ellipse, not a circle */}
      <div
        className="absolute w-[100px] h-[50px] bg-blue-500/15 rounded-[100%] blur-lg pointer-events-none"
        style={{
          left: "var(--x, -1000px)",
          top: "var(--y, -1000px)",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
