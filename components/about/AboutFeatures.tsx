"use client";

import { motion } from "framer-motion";
import { ABOUT_FEATURES } from "@/lib/data/about";

/** "Why Great Nature Homes" — three pillars, in the same dot-accent language as ProjectAmenities. */
export function AboutFeatures() {
  return (
    <section className="bg-forest-950 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-400">Why Choose Us</span>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-stone-50 sm:text-4xl">
            Why Great Nature Homes
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {ABOUT_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="rounded-2xl border border-stone-50/10 bg-stone-50/[0.03] p-7"
            >
              <span className="block h-1.5 w-8 rounded-full bg-clay-500" />
              <h3 className="mt-5 font-display text-xl font-medium text-stone-50">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-200/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
