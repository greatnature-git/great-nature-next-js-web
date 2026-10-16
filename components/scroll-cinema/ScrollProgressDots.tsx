"use client";

import { useEffect, useState } from "react";
import type { MotionValue } from "framer-motion";

interface ScrollProgressDotsProps {
  progress: MotionValue<number>;
  count: number;
  className?: string;
}

/** A thin dot indicator showing which scroll-driven segment is active. */
export function ScrollProgressDots({ progress, count, className }: ScrollProgressDotsProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const unsubscribe = progress.on("change", (value) => {
      setActive(Math.min(count - 1, Math.floor(value * count)));
    });
    return unsubscribe;
  }, [progress, count]);

  return (
    <div className={className} role="tablist" aria-label="Feature progress">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          role="tab"
          aria-selected={index === active}
          className={`block h-1.5 rounded-full transition-all duration-300 ${
            index === active ? "w-6 bg-clay-400" : "w-1.5 bg-stone-100/40"
          }`}
        />
      ))}
    </div>
  );
}
