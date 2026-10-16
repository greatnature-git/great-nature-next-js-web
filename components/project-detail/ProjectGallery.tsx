"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface ProjectGalleryProps {
  images: string[];
  alt: string;
}

/**
 * A large primary image with an optional thumbnail rail (only once there's
 * more than one photo — today every project has exactly one). Clicking the
 * primary image opens a full-screen view; no lightbox dependency needed.
 */
export function ProjectGallery({ images, alt }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const activeSrc = images[activeIndex] ?? images[0];

  return (
    <section id="gallery" className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Gallery</span>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
            A Closer Look
          </h2>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="group relative mt-8 block h-[52vh] w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={activeSrc}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-4 right-4 rounded-full bg-forest-950/70 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-50 backdrop-blur-sm">
              View Full Screen
            </span>
          </button>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-20 overflow-hidden rounded-lg ring-2 transition-colors ${
                    index === activeIndex ? "ring-clay-500" : "ring-transparent hover:ring-stone-300"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-forest-950/95 backdrop-blur-sm"
          >
            <div className="flex justify-end p-6">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-xs font-medium uppercase tracking-[0.25em] text-stone-50/80 transition-colors hover:text-clay-400"
              >
                Close
              </button>
            </div>
            <div className="relative mx-6 mb-6 flex-1 overflow-hidden rounded-2xl sm:mx-10 sm:mb-10">
              <Image src={activeSrc} alt={alt} fill sizes="100vw" className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
