"use client";

import { useMemo } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollCinemaSection } from "@/components/scroll-cinema/ScrollCinemaSection";
import { HeroOverlay } from "@/components/scroll-cinema/HeroOverlay";
import { useIsCoarseOrSmall } from "@/lib/hooks/useMediaQuery";

const HERO_FRAME_COUNT = { desktop: 240, mobile: 120 };

function buildFrameUrls(base: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${base}/frame_${String(i + 1).padStart(4, "0")}.webp`);
}

export function HeroScrollSection() {
  const isMobile = useIsCoarseOrSmall();
  const frameUrls = useMemo(
    () =>
      buildFrameUrls(
        isMobile ? "/frames/hero-mobile" : "/frames/hero",
        isMobile ? HERO_FRAME_COUNT.mobile : HERO_FRAME_COUNT.desktop
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
      <span className="font-display text-sm uppercase tracking-[0.35em] text-stone-50/80">Scroll to begin</span>
      <span className="h-10 w-px bg-stone-50/50" />
    </motion.div>
  );
}
