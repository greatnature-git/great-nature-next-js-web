"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { TRUST_STATS, type TrustStat } from "@/lib/data/stats";

interface TrustStatsIntroProps {
  /** The hero's overall 0-1 scroll progress. */
  progress: MotionValue<number>;
  /** How much of the overall progress this opening beat occupies, e.g. 1/8. */
  segment: number;
}

/**
 * The hero's opening beat: a scroll-scrubbed "by the numbers" count-up,
 * shown before the feature callouts begin. The counters tick up as the
 * user scrolls through this segment (not on a timer), so it stays
 * consistent with the rest of the site's scroll-driven feel. Sits on its
 * own frosted panel rather than bare over the video, since the footage
 * underneath varies frame to frame and plain text loses contrast against it.
 */
export function TrustStatsIntro({ progress, segment }: TrustStatsIntroProps) {
  const fade = segment * 0.18;
  const holdStart = fade;
  const holdEnd = segment - fade;

  const opacity = useTransform(progress, [0, fade, holdEnd, segment], [0, 1, 1, 0]);
  const y = useTransform(progress, [0, fade, holdEnd, segment], [24, 0, 0, -24]);

  const countSpan = (holdEnd - holdStart) * 0.7;

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
    >
      <div className="w-full max-w-4xl rounded-[2rem] border border-stone-50/15 bg-forest-950/60 px-6 py-10 text-center shadow-2xl shadow-forest-950/50 backdrop-blur-md sm:px-14 sm:py-12">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-400">
          Great Nature Homes, By The Numbers
        </span>
        <h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-stone-50 sm:text-3xl">
          A Track Record You Can Build On
        </h3>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 sm:gap-x-2 sm:divide-x sm:divide-stone-50/15">
          {TRUST_STATS.map((stat, index) => (
            <StatCounter
              key={stat.label}
              stat={stat}
              progress={progress}
              countStart={holdStart + index * 0.004}
              countEnd={holdStart + countSpan + index * 0.004}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatCounter({
  stat,
  progress,
  countStart,
  countEnd,
}: {
  stat: TrustStat;
  progress: MotionValue<number>;
  countStart: number;
  countEnd: number;
}) {
  const count = useTransform(progress, [countStart, countEnd], [0, stat.value], { clamp: true });
  const barWidth = useTransform(progress, [countStart, countEnd], ["0%", "100%"], { clamp: true });
  const [display, setDisplay] = useState(() => Math.round(count.get()));

  useEffect(() => {
    return count.on("change", (value) => setDisplay(Math.round(value)));
  }, [count]);

  return (
    <div className="flex flex-col items-center px-2">
      <p className="font-display text-4xl font-medium text-stone-50 [text-shadow:0_2px_16px_rgba(0,0,0,0.5)] sm:text-5xl">
        {display}
        <span className="text-clay-400">{stat.suffix}</span>
      </p>
      <p className="mt-2 max-w-[8.5rem] text-[11px] font-medium uppercase tracking-wide text-stone-100/90 sm:text-xs">
        {stat.label}
      </p>
      <span className="mt-3 block h-0.5 w-10 overflow-hidden rounded-full bg-stone-50/15">
        <motion.span style={{ width: barWidth }} className="block h-full rounded-full bg-clay-400" />
      </span>
    </div>
  );
}
