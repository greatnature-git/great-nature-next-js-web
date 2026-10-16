"use client";

import { motion } from "framer-motion";

/** A restrained amenities grid — the clay dot accent, not an icon set, carries the visual weight. */
export function ProjectAmenities({ amenities }: { amenities: string[] }) {
  return (
    <section className="bg-forest-950 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-400">Amenities</span>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-stone-50 sm:text-4xl">
            Everything the Community Shares
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-3 border-b border-stone-50/10 pb-4">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
              <span className="text-sm text-stone-100/90">{amenity}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
