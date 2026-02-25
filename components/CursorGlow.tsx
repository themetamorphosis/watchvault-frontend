"use client";

import React, { useEffect, useRef } from "react";

export default function CursorGlow() {
  const mouse = useRef({ x: -9999, y: -9999 });
  const glow = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number | null>(null);
  const isInside = useRef(false);

  useEffect(() => {
    const root = document.documentElement;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // smaller = heavier "gravity" (more lag). Try 0.06–0.12
      const ease = 0.08;

      glow.current.x = lerp(glow.current.x, mouse.current.x, ease);
      glow.current.y = lerp(glow.current.y, mouse.current.y, ease);

      root.style.setProperty("--mx", `${glow.current.x}px`);
      root.style.setProperty("--my", `${glow.current.y}px`);

      raf.current = requestAnimationFrame(tick);
    };

    function onMove(e: PointerEvent) {
      isInside.current = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      root.style.setProperty("--gb", "1");
    }

    function onLeave() {
      isInside.current = false;
      root.style.setProperty("--gb", "0.25");
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove as EventListener);
      window.removeEventListener("pointerleave", onLeave as EventListener);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div className="cursor-glow" aria-hidden="true" />;
}
