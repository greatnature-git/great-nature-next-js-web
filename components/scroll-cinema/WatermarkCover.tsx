"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCoverRect } from "@/lib/scroll-cinema/drawFrame";

/** All four frame sequences are 16:9 source renders. */
const SOURCE_RATIO = 16 / 9;

/**
 * The generator's watermark sparkle sits at this fixed fraction of every
 * source frame (measured directly off the rendered frames), regardless of
 * sequence or resolution. The box is sized generously around it so the
 * opaque badge fully hides the mark instead of merely dimming it.
 */
const MARK_CENTER = { x: 0.903, y: 0.83 };
const MARK_BOX = { width: 0.1125, height: 0.1333 };

/**
 * Covers the AI frame generator's watermark with a small brand badge,
 * positioned using the same cover-fit math the canvas draws frames with so
 * it tracks the watermark's on-screen spot as the viewport resizes.
 */
export function WatermarkCover({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setSize({ width, height });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  if (!size) return null;

  const { dx, dy, drawWidth, drawHeight } = getCoverRect(size.width, size.height, SOURCE_RATIO);

  const centerX = dx + MARK_CENTER.x * drawWidth;
  const centerY = dy + MARK_CENTER.y * drawHeight;
  const boxWidth = MARK_BOX.width * drawWidth;
  const boxHeight = MARK_BOX.height * drawHeight;

  // Off the edge of the visible crop (narrow portrait viewports) — nothing to cover.
  if (centerX < -boxWidth / 2 || centerX > size.width + boxWidth / 2) return null;

  // Fit the logo inside the box with an inset, in px rather than CSS
  // percentage padding: percentage padding on an absolutely positioned flex
  // box resolves against the containing block (the viewport), not this box,
  // which both makes the inset way too large and inflates the box itself.
  const LOGO_RATIO = 800 / 494;
  const availableWidth = boxWidth * 0.86;
  const availableHeight = boxHeight * 0.86;
  const logoWidth = Math.min(availableWidth, availableHeight * LOGO_RATIO);
  const logoHeight = logoWidth / LOGO_RATIO;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute flex items-center justify-center rounded-xl bg-forest-950 shadow-[0_2px_12px_rgba(8,12,7,0.35)]"
      style={{
        left: centerX,
        top: centerY,
        width: boxWidth,
        height: boxHeight,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Image
        src="/logo-wordmark.png"
        alt=""
        width={800}
        height={494}
        style={{ width: logoWidth, height: logoHeight }}
        className="object-contain opacity-95"
      />
    </div>
  );
}
