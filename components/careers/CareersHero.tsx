"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/** The opening banner of the Careers page — mirrors AboutHero's language for consistency across the site's secondary pages. */
export function CareersHero() {
  return (
    <section className="relative flex h-[55vh] min-h-[420px] w-full items-end overflow-hidden bg-forest-950">
      <Image
        src="/projects-poster.jpg"
        alt="A Great Nature Homes villa community"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/45 to-forest-950/10" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-6xl px-6 pb-14 sm:px-10 sm:pb-20"
      >
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-300/80">
          <Link href="/" className="transition-colors hover:text-clay-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-50">Careers</span>
        </nav>

        <h1 className="mt-5 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl md:text-6xl">
          Careers
        </h1>
      </motion.div>
    </section>
  );
}
