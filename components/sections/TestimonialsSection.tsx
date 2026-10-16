"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/data/testimonials";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

const AUTOPLAY_INTERVAL = 7000;

// Ambient villa photography, cycled independently of which testimonial is
// active — these are real client reviews, but they reference properties
// (e.g. Mexican Bungalows) outside this site's own project catalog, so the
// image can't honestly claim to show the specific home being described.
const AMBIENT_PHOTOS = [
  "/projects/emerald-hills.jpg",
  "/projects/silver-oak.jpg",
  "/projects/whispering-pines.jpg",
  "/projects/rosewood-meadows.jpg",
];

function getInitials(name: string) {
  const words = name.replace(/&/g, " ").split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "")).toUpperCase();
}

/**
 * A rotating quote spotlight rather than another card grid — the home page
 * already shows projects as cards just above this, so testimonials lean on
 * a different shape to keep the page from feeling repetitive. No photos of
 * the reviewers are used — a stock photo standing in for a named "client"
 * would misrepresent it as that real person's likeness.
 */
export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const total = TESTIMONIALS.length;

  const goTo = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(() => setIndex((current) => (current + 1) % total), AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
    // index is a dep on purpose: re-arming on every change (including manual
    // navigation) means a manual click always gets a full interval before
    // auto-advancing again, instead of jumping right after the user clicked.
  }, [paused, reducedMotion, total, index]);

  const active = TESTIMONIALS[index];

  return (
    <section className="bg-stone-50 px-6 py-24 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Client Stories</span>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-forest-950 sm:text-5xl">
            Loved By The Families We&apos;ve Built For
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div className="relative h-72 overflow-hidden rounded-3xl sm:h-96 lg:h-[26rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={AMBIENT_PHOTOS[index % AMBIENT_PHOTOS.length]}
                  alt="A Great Nature Homes villa community"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 text-xs font-medium uppercase tracking-wide text-stone-50/90">
                  A Great Nature Homes Community
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-14 left-0 select-none font-display text-[7rem] leading-none text-clay-400/25 sm:text-[8rem]"
            >
              &ldquo;
            </span>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div aria-hidden="true" className="flex gap-1 text-clay-500">
                    {Array.from({ length: active.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="mt-6 text-balance font-display text-xl font-medium leading-relaxed text-forest-950 sm:text-2xl">
                    {active.quote}
                  </p>
                  <div className="mt-7 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-950 font-display text-sm text-stone-50"
                    >
                      {getInitials(active.name)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-forest-950">{active.name}</p>
                      <p className="text-xs uppercase tracking-wide text-stone-500">
                        {active.role}
                        {active.project && ` · ${active.project}`}
                        {active.company && ` · via ${active.company}`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-900/15 text-forest-950 transition-colors hover:border-clay-500 hover:text-clay-600"
              >
                ←
              </button>

              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((testimonial, i) => (
                  <button
                    key={testimonial.name}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show testimonial from ${testimonial.name}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-clay-500" : "w-1.5 bg-stone-300"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-900/15 text-forest-950 transition-colors hover:border-clay-500 hover:text-clay-600"
              >
                →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
