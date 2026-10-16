"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Drives inertial scrolling site-wide with Lenis and keeps GSAP's
 * ScrollTrigger in lockstep by feeding Lenis off GSAP's own ticker.
 * This is what keeps the frame-scrub and the smooth-scroll in sync.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      // Deliberately no `duration`/`easing`: those make every wheel tick
      // restart a full eased tween from the current (still-easing) position,
      // which reads as "stuck" catch-up lag during slow, discrete scrolling
      // (fast scrolling retargets before the tail is noticeable, so it was
      // hiding the problem). `lerp` recalculates against the live target
      // every frame instead, which stays responsive at any scroll speed.
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
