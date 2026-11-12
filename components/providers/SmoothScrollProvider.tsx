"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Lenis takes over scroll and re-asserts its own target every frame, so a
// raw `window.scrollTo()` from elsewhere in the app gets overridden on the
// next tick. Anything that needs to drive scroll programmatically (e.g. a
// nav link back to the page you're already on) has to go through this same
// instance's `scrollTo` instead. Handed out as a ref (read at the moment
// it's needed, e.g. inside a click handler) rather than state, since
// mounting/destroying Lenis doesn't need to trigger a re-render anywhere.
const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Drives inertial scrolling site-wide with Lenis and keeps GSAP's
 * ScrollTrigger in lockstep by feeding Lenis off GSAP's own ticker.
 * This is what keeps the frame-scrub and the smooth-scroll in sync.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const instance = new Lenis({
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

    instance.on("scroll", ScrollTrigger.update);
    lenisRef.current = instance;

    const tick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
