"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const supportsFinePointer = window.matchMedia(
      "(pointer: fine) and (min-width: 768px)"
    ).matches;

    if (!supportsFinePointer) {
      return;
    }

    const lenis = new Lenis({
      anchors: {
        offset: -96
      },
      duration: 1.12,
      easing: (time: number) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.86
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
