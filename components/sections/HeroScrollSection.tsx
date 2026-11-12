"use client";

import { useMemo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollCinemaSection } from "@/components/scroll-cinema/ScrollCinemaSection";
import { HeroOverlay } from "@/components/scroll-cinema/HeroOverlay";
import { useIsCoarseOrSmall } from "@/lib/hooks/useMediaQuery";

const HERO_FRAME_COUNT = { desktop: 240, mobile: 120 };
// Keep full frame density: the canvas cross-fades between whichever two
// frames straddle the scroll position during slow scrubbing, and widening
// the gap between kept frames (e.g. sampling every other one) makes that
// blend composite two more visually distant stills, which reads as a
// double-exposure ghost rather than smooth motion.
const HERO_FRAME_STRIDE = 1;

function buildFrameUrls(base: string, totalRendered: number, stride: number) {
  return Array.from(
    { length: Math.ceil(totalRendered / stride) },
    (_, i) => `${base}/frame_${String(i * stride + 1).padStart(4, "0")}.webp`
  );
}

export function HeroScrollSection() {
  const isMobile = useIsCoarseOrSmall();
  const frameUrls = useMemo(
    () =>
      buildFrameUrls(
        isMobile ? "/frames/hero-mobile" : "/frames/hero",
        isMobile ? HERO_FRAME_COUNT.mobile : HERO_FRAME_COUNT.desktop,
        HERO_FRAME_STRIDE
      ),
    [isMobile]
  );

  return (
    <ScrollCinemaSection
      id="hero"
      heightVh={630}
      frameUrls={frameUrls}
      posterSrc="/hero-poster.jpg"
      fallbackVideoSrc="/videos/hero-fallback.mp4"
      loadingLabel="Loading the walkthrough"
    >
      {({ progress }) => (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950/55 via-transparent to-forest-950/75" />
          <ScrollCue progress={progress} />
          <HeroOverlay progress={progress} />
        </>
      )}
    </ScrollCinemaSection>
  );
}

function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.04], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 top-1/2 flex flex-col items-center gap-4 text-center"
    >
      <span className="rounded-full border border-stone-50/10 bg-forest-950/45 px-5 py-2 font-display text-sm uppercase tracking-[0.35em] text-stone-50/90 backdrop-blur-sm [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
        Scroll to begin
      </span>
      <span className="h-10 w-px bg-stone-50/50 shadow-[0_0_12px_rgba(0,0,0,0.5)]" />
    </motion.div>
  );
}
