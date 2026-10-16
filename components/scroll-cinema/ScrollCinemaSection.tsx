"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameCanvas, type FrameCanvasHandle } from "./FrameCanvas";
import { WatermarkCover } from "./WatermarkCover";
import { useFrameSequence } from "@/lib/scroll-cinema/useFrameSequence";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

export interface CinemaRenderMeta {
  progress: MotionValue<number>;
  isReady: boolean;
  loadedCount: number;
  total: number;
}

interface ScrollCinemaSectionProps {
  id?: string;
  heightVh?: number;
  frameUrls: string[];
  posterSrc: string;
  fallbackVideoSrc: string;
  className?: string;
  loadingLabel?: string;
  children?: (meta: CinemaRenderMeta) => React.ReactNode;
}

/**
 * Scroll can race ahead of the frame downloads. Rather than snapping back to
 * frame 0 whenever the exact target isn't loaded yet (which reads as the
 * scrub "sticking"), hold the closest frame that is loaded, so motion stays
 * continuous and only ever looks a touch soft until the real frame lands.
 */
function findNearestLoadedFrame(frames: HTMLImageElement[], index: number) {
  if (frames[index]) return frames[index];
  for (let offset = 1; offset < frames.length; offset++) {
    if (frames[index - offset]) return frames[index - offset];
    if (frames[index + offset]) return frames[index + offset];
  }
  return undefined;
}

/**
 * The scroll-video mechanic: a tall scroll track with a sticky, full-viewport
 * canvas inside it. Scroll progress (driven by Lenis -> GSAP ScrollTrigger)
 * is mapped linearly to a frame index and painted on rAF, never inside the
 * scroll event itself.
 */
export function ScrollCinemaSection({
  id,
  heightVh = 500,
  frameUrls,
  posterSrc,
  fallbackVideoSrc,
  className,
  loadingLabel = "Loading cinematic preview",
  children,
}: ScrollCinemaSectionProps) {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasHandleRef = useRef<FrameCanvasHandle>(null);
  const progress = useMotionValue(0);

  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!wrapperRef.current || reducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px 800px 0px" }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const { frames, loadedCount, total, firstFrameReady, isReady } = useFrameSequence(frameUrls, {
    active: active && !reducedMotion,
  });

  // The frames load in spread-out "coverage" order (see useFrameSequence), so
  // scrubbing already looks smooth well before every single frame is in —
  // gate the loading overlay on that lighter threshold instead of 100%, so
  // the cinematic feels responsive almost immediately instead of stalling
  // the whole scroll on a full download.
  const scrubReadyThreshold = Math.min(total, Math.max(16, Math.ceil(total / 10)));
  const scrubReady = isReady || loadedCount >= scrubReadyThreshold;

  // GSAP's scrub onUpdate can fire more than once per animation frame;
  // coalesce draws onto the next rAF instead of drawing synchronously.
  const pendingIndexRef = useRef(0);
  const rafScheduledRef = useRef(false);
  const drawPending = () => {
    rafScheduledRef.current = false;
    const index = pendingIndexRef.current;
    const frame = findNearestLoadedFrame(frames.current, index);
    canvasHandleRef.current?.drawFrame(frame);
  };
  const scheduleDraw = (index: number) => {
    pendingIndexRef.current = index;
    if (!rafScheduledRef.current) {
      rafScheduledRef.current = true;
      requestAnimationFrame(drawPending);
    }
  };

  useEffect(() => {
    if (firstFrameReady) scheduleDraw(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstFrameReady]);

  useEffect(() => {
    if (reducedMotion) progress.set(1);
  }, [reducedMotion, progress]);

  useEffect(() => {
    if (reducedMotion || !wrapperRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progress.set(self.progress);
        if (total > 0) {
          const frameIndex = Math.min(total - 1, Math.round(self.progress * (total - 1)));
          scheduleDraw(frameIndex);
        }
      },
    });

    return () => trigger.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, total, progress]);

  if (reducedMotion) {
    return (
      <section id={id} className={className}>
        <div ref={viewportRef} className="relative h-screen w-full overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={fallbackVideoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
          />
          <WatermarkCover containerRef={viewportRef} />
          {children?.({ progress, isReady: true, loadedCount: total, total })}
        </div>
      </section>
    );
  }

  return (
    <section id={id} ref={wrapperRef} className={className} style={{ height: `${heightVh}vh` }}>
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-forest-950 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
      >
        <FrameCanvas ref={canvasHandleRef} className="absolute inset-0 h-full w-full" />
        <WatermarkCover containerRef={viewportRef} />
        {!scrubReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-forest-950/80 text-stone-100">
            <span className="text-xs uppercase tracking-[0.2em] text-stone-300">{loadingLabel}</span>
            <div className="h-0.5 w-40 overflow-hidden rounded-full bg-stone-100/20">
              <div
                className="h-full bg-clay-400 transition-[width] duration-200 ease-out"
                style={{ width: `${total ? (loadedCount / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
        {children?.({ progress, isReady, loadedCount, total })}
      </div>
    </section>
  );
}
