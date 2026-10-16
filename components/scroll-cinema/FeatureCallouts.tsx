"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollProgressDots } from "./ScrollProgressDots";

export interface FeatureCallout {
  title: string;
  caption?: string;
}

interface FeatureCalloutsProps {
  progress: MotionValue<number>;
  features: FeatureCallout[];
}

/**
 * Large text callouts timed to scroll-progress ranges, driven by the exact
 * same progress value used for the frame scrub so text and visuals never
 * desync. One feature is "active" (held, fully visible) at a time.
 */
export function FeatureCallouts({ progress, features }: FeatureCalloutsProps) {
  const segment = 1 / features.length;

  return (
    <div className="pointer-events-none absolute inset-0">
      {features.map((feature, index) => (
        <CalloutItem
          key={feature.title}
          index={index}
          total={features.length}
          segment={segment}
          progress={progress}
          feature={feature}
        />
      ))}
      <ScrollProgressDots
        progress={progress}
        count={features.length}
        className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-2"
      />
    </div>
  );
}

function CalloutItem({
  index,
  total,
  segment,
  progress,
  feature,
}: {
  index: number;
  total: number;
  segment: number;
  progress: MotionValue<number>;
  feature: FeatureCallout;
}) {
  const start = index * segment;
  const end = start + segment;
  const fade = segment * 0.22;

  const opacity = useTransform(progress, [start, start + fade, end - fade, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + fade, end - fade, end], [28, 0, 0, -28]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-[16%] flex flex-col items-center px-6 text-center md:bottom-[20%]"
    >
      <span className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-clay-400">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <h3 className="font-display text-3xl font-medium tracking-tight text-stone-50 drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl">
        {feature.title}
      </h3>
      {feature.caption && (
        <p className="mt-3 max-w-md text-sm text-stone-100/90 drop-shadow-md sm:text-base">{feature.caption}</p>
      )}
    </motion.div>
  );
}
