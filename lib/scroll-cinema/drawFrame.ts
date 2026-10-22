export interface CoverRect {
  dx: number;
  dy: number;
  drawWidth: number;
  drawHeight: number;
}

/**
 * The box an image of the given aspect ratio lands in in canvas space under
 * "object-fit: cover" semantics. Shared by the canvas draw below and by
 * overlays (e.g. the watermark cover badge) that need to locate a point
 * within the source frame on screen.
 */
export function getCoverRect(cssWidth: number, cssHeight: number, imageRatio: number): CoverRect {
  const canvasRatio = cssWidth / cssHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imageRatio > canvasRatio) {
    drawHeight = cssHeight;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = cssWidth;
    drawHeight = drawWidth / imageRatio;
  }

  return {
    dx: (cssWidth - drawWidth) / 2,
    dy: (cssHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
}

export interface FrameBlend {
  next: HTMLImageElement;
  amount: number;
}

/**
 * Draws an image onto a canvas using "object-fit: cover" semantics, scaled
 * for the current devicePixelRatio so the frame sequence stays crisp.
 *
 * When `blend` is given, the next frame is cross-faded on top by `amount`
 * (0-1). The scroll-to-frame-index mapping is otherwise a hard cut between
 * stills, which only reads as motion when frames flip fast enough (fast
 * scrolling); a slow scroll holds a single still for a long time with no
 * motion at all in between, which reads as the scrub "sticking". Blending
 * toward the next frame keeps motion continuous at any scroll speed.
 */
export function drawFrameCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cssWidth: number,
  cssHeight: number,
  blend?: FrameBlend
) {
  const { naturalWidth: iw, naturalHeight: ih } = image;
  if (iw === 0 || ih === 0) return;

  const { dx, dy, drawWidth, drawHeight } = getCoverRect(cssWidth, cssHeight, iw / ih);

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

  if (blend && blend.amount > 0 && blend.next.naturalWidth > 0) {
    ctx.globalAlpha = Math.min(1, blend.amount);
    ctx.drawImage(blend.next, dx, dy, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
  }
}

export function sizeCanvasToElement(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetWidth = Math.round(cssWidth * dpr);
  const targetHeight = Math.round(cssHeight * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
