"use client";

import { useTransform, type MotionValue } from "framer-motion";
import { FeatureCallouts } from "@/components/scroll-cinema/FeatureCallouts";
import { TrustStatsIntro } from "@/components/scroll-cinema/TrustStatsIntro";
import { HERO_FEATURES } from "@/lib/data/features";

/** The opening "by the numbers" beat occupies the first 1/8 of the hero scroll. */
const STATS_SEGMENT = 1 / 8;

/**
 * Composes the hero's two overlay beats. Kept as its own component (rather
 * than inline in a render-prop) so the progress remap below runs as a proper
 * hook call tied to this component's own render, not whichever component
 * happens to be invoking the render prop.
 */
export function HeroOverlay({ progress }: { progress: MotionValue<number> }) {
  const featuresProgress = useTransform(progress, [STATS_SEGMENT, 1], [0, 1], { clamp: true });

  return (
    <>
      <TrustStatsIntro progress={progress} segment={STATS_SEGMENT} />
      <FeatureCallouts progress={featuresProgress} features={HERO_FEATURES} />
    </>
  );
}
