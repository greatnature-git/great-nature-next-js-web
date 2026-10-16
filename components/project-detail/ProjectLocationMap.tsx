"use client";

import { motion } from "framer-motion";
import type { NearbyPlace } from "@/lib/data/projects";

interface ProjectLocationMapProps {
  location: string;
  nearby: NearbyPlace[];
  mapQuery: string;
}

/** A plain Google Maps embed (no API key), plus a "What's Nearby" list of real, verified distances. */
export function ProjectLocationMap({ location, nearby, mapQuery }: ProjectLocationMapProps) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <section className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]"
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Location</span>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
              {location}
            </h2>

            <div className="mt-8 overflow-hidden rounded-2xl border border-forest-900/10">
              <iframe
                src={embedSrc}
                title={`Map of ${location}`}
                className="h-[380px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {nearby.length > 0 && (
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">What&apos;s Nearby</span>
              <div className="mt-5 divide-y divide-forest-900/10 border-t border-forest-900/10">
                {nearby.map((place) => (
                  <div key={place.name} className="flex items-center justify-between py-3.5">
                    <span className="text-sm text-stone-700">{place.name}</span>
                    <span className="text-sm font-medium text-forest-950">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
