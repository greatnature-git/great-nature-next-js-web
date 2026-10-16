"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/data/projects";

/** The opening beat of a project detail page — always in view on load, so it animates on mount, not on scroll. */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <section className="relative flex h-[75vh] min-h-[560px] w-full items-end overflow-hidden bg-forest-950">
      <Image
        src={project.gallery[0]}
        alt={project.name}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/35 to-forest-950/10" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-6xl px-6 pb-14 sm:px-10 sm:pb-20"
      >
        <Link
          href="/projects"
          className="text-xs font-medium uppercase tracking-[0.25em] text-stone-50/70 transition-colors hover:text-clay-400"
        >
          ← All Projects
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-forest-950/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-stone-50 ring-1 ring-stone-50/20 backdrop-blur-sm">
            {project.status}
          </span>
          <span className="text-sm text-stone-200/90">{project.location}</span>
        </div>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl md:text-6xl">
          {project.name}
        </h1>
        <p className="mt-4 max-w-xl text-balance text-stone-200/85">{project.tagline}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#enquiry"
            className="rounded-full bg-clay-500 px-7 py-3.5 text-sm font-semibold text-stone-50 transition-colors hover:bg-clay-600"
          >
            Enquire About This Villa
          </a>
          <a
            href="#gallery"
            className="rounded-full border border-stone-50/30 px-7 py-3.5 text-sm font-semibold text-stone-50 transition-colors hover:border-stone-50/60"
          >
            View Gallery
          </a>
        </div>
      </motion.div>
    </section>
  );
}
