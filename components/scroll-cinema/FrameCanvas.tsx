"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { drawFrameCover, sizeCanvasToElement } from "@/lib/scroll-cinema/drawFrame";

export interface FrameCanvasHandle {
  drawFrame: (image: HTMLImageElement | undefined) => void;
}

interface FrameCanvasProps {
  className?: string;
}

/**
 * A bare <canvas> that exposes an imperative drawFrame() handle. Kept
 * separate from scroll/progress logic so it only ever re-renders for
 * layout reasons, never on scroll ticks.
 */
export const FrameCanvas = forwardRef<FrameCanvasHandle, FrameCanvasProps>(function FrameCanvas(
  { className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastImageRef = useRef<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      ctxRef.current = sizeCanvasToElement(canvas, width, height);
      if (lastImageRef.current && ctxRef.current) {
        drawFrameCover(ctxRef.current, lastImageRef.current, width, height);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("orientationchange", resize);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      drawFrame(image) {
        if (!image) return;
        lastImageRef.current = image;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const { width, height } = canvas.getBoundingClientRect();
        drawFrameCover(ctx, image, width, height);
      },
    }),
    []
  );

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});
