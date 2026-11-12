"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

const FALLBACK_TIMEOUT_MS = 8000;
const FADE_MS = 600;

type Phase = "playing" | "closing" | "done";

// A hard browser refresh (not a link click, not a fresh/direct visit) is
// reported by the Navigation Timing API as "reload" — that's the one case
// the product wants to always bounce back to the top of the homepage,
// splash and all.
function isHardRefresh() {
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type === "reload";
}

// useLayoutEffect warns when it runs during SSR (this component is still
// server-rendered for the initial HTML under the App Router); fall back to
// useEffect there since this only matters once the page is in the browser.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("playing");
  const closedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const router = useRouter();

  const close = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    setPhase("closing");
    window.setTimeout(() => setPhase("done"), FADE_MS);
  };

  // Runs as a layout effect (before paint, and before SmoothScrollProvider's
  // own effect initializes Lenis) so the browser's own scroll restoration
  // never has a chance to leave the page part-way down before Lenis reads
  // that position as its starting point.
  useIsomorphicLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (!isHardRefresh()) return;

    window.scrollTo(0, 0);
    if (window.location.pathname !== "/") {
      router.replace("/");
    }

    // The splash video (preload="auto") delays the `load` event well past
    // when this effect first runs; some browsers restore the previous
    // scroll offset right at `load`, after the reset above has already
    // happened, so re-assert it once more when that fires.
    const resetScroll = () => window.scrollTo(0, 0);
    window.addEventListener("load", resetScroll);
    return () => window.removeEventListener("load", resetScroll);
  }, [router]);

  useEffect(() => {
    if (phase !== "playing" || reducedMotion !== true) return;
    close();
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "playing") return;
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(close, FALLBACK_TIMEOUT_MS);

    // Belt-and-braces: some browsers only honor autoplay when `muted` is set
    // as a live DOM property (not just the JSX/HTML attribute) before play() runs.
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {
        // Autoplay was blocked — the fallback timeout above still closes the
        // splash after FALLBACK_TIMEOUT_MS so the site is never stuck.
      });
    }

    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
    }
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      role="dialog"
      aria-label="Great Nature Homes"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-[600ms] ease-out ${
        phase === "closing" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        className="h-auto max-h-[80vh] w-[min(90vw,640px)] object-contain"
        src="/videos/logo-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={close}
        onError={close}
      />
      <button
        type="button"
        onClick={close}
        className="absolute bottom-6 right-6 cursor-pointer text-sm tracking-wide text-stone-200/70 transition-colors hover:text-stone-50"
      >
        Skip
      </button>
    </div>
  );
}
