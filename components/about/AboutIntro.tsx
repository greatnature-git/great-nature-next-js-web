"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ABOUT_INTRO, ABOUT_MISSION, ABOUT_VISION } from "@/lib/data/about";

/** The "who we are" intro, plus Mission & Vision — the About page's equivalent of a project's Overview section. */
export function AboutIntro() {
  return (
    <section className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative grid grid-cols-2 gap-4"
          >
            <div className="relative h-56 overflow-hidden rounded-2xl sm:h-72">
              <Image
                src="/projects/emerald-hills.jpg"
                alt="A Great Nature Homes villa"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 h-56 overflow-hidden rounded-2xl sm:mt-14 sm:h-72">
              <Image
                src="/projects/silver-oak.jpg"
                alt="A Great Nature Homes villa interior"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">
              {ABOUT_INTRO.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
              {ABOUT_INTRO.heading}
            </h2>
            <div className="mt-5 space-y-4 text-stone-700">
              {ABOUT_INTRO.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <Link
              href="/projects"
              className="mt-8 inline-block rounded-full bg-clay-500 px-7 py-3.5 text-sm font-semibold text-stone-50 transition-colors hover:bg-clay-600"
            >
              View Our Projects
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-16 grid grid-cols-1 gap-6 border-t border-forest-900/10 pt-14 sm:grid-cols-2 sm:gap-10"
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Our Mission</span>
            <p className="mt-3 text-stone-700">{ABOUT_MISSION}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Our Vision</span>
            <p className="mt-3 text-stone-700">{ABOUT_VISION}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
