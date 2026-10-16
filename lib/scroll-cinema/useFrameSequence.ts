"use client";

import { useEffect, useRef, useState } from "react";

interface UseFrameSequenceOptions {
  /** Only start fetching once true (e.g. section is near the viewport). */
  active: boolean;
  /** How many frames to fetch in parallel. */
  concurrency?: number;
}

interface FrameSequenceState {
  loadedCount: number;
  total: number;
  firstFrameReady: boolean;
  isReady: boolean;
}

/**
 * Builds a load order that covers the full range as early as possible by
 * repeatedly bisecting the largest unloaded gap, instead of loading
 * frame-by-frame in sequence. That way a scroll that races ahead of the
 * download always lands near a frame that's already loaded, rather than
 * running off the end of a strictly-sequential queue.
 */
function buildCoverageOrder(total: number): number[] {
  if (total <= 2) return Array.from({ length: total }, (_, i) => i);

  const order = [0, total - 1];
  const seen = new Set(order);
  const queue: Array<[number, number]> = [[0, total - 1]];

  while (queue.length > 0) {
    const [lo, hi] = queue.shift()!;
    if (hi - lo <= 1) continue;
    const mid = lo + Math.floor((hi - lo) / 2);
    if (!seen.has(mid)) {
      order.push(mid);
      seen.add(mid);
    }
    queue.push([lo, mid], [mid, hi]);
  }

  return order;
}

/**
 * Preloads a numbered frame sequence into an in-memory Image cache.
 * Frame 0 loads first (and alone) so the canvas can paint instantly, then
 * the rest load behind a small concurrency pool in coverage order so the
 * whole range gets a rough pass before any one stretch is filled in fully.
 */
export function useFrameSequence(urls: string[], { active, concurrency = 8 }: UseFrameSequenceOptions) {
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [state, setState] = useState<FrameSequenceState>({
    loadedCount: 0,
    total: urls.length,
    firstFrameReady: false,
    isReady: urls.length === 0,
  });

  useEffect(() => {
    if (!active || urls.length === 0) return;

    let cancelled = false;
    let loaded = 0;
    framesRef.current = new Array(urls.length);

    const markLoaded = () => {
      if (cancelled) return;
      loaded += 1;
      setState({
        loadedCount: loaded,
        total: urls.length,
        firstFrameReady: true,
        isReady: loaded >= urls.length,
      });
    };

    const loadOne = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => {
          framesRef.current[index] = img;
          markLoaded();
          resolve();
        };
        img.onerror = () => {
          markLoaded();
          resolve();
        };
        img.src = urls[index];
      });

    const run = async () => {
      await loadOne(0);
      if (cancelled) return;

      const order = buildCoverageOrder(urls.length).filter((index) => index !== 0);
      let cursor = 0;
      const worker = async () => {
        while (!cancelled) {
          const pos = cursor;
          cursor += 1;
          if (pos >= order.length) return;
          await loadOne(order[pos]);
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(order.length, 1)) }, worker));
    };

    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, urls.join("|")]);

  return { frames: framesRef, ...state };
}
