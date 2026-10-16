"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PREVIOUS_PROJECTS } from "@/lib/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";

/**
 * A lightweight, static preview of completed projects on the home page.
 * The full cinematic walkthrough and complete listing live on their own
 * /projects page so the home page isn't loading two frame sequences at once.
 */
export function ProjectsTeaserSection() {
  const preview = PREVIOUS_PROJECTS.slice(0, 3);

  return (
    <section id="projects" className="bg-stone-50 px-6 py-24 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Previous Projects</span>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-forest-950 sm:text-5xl">
            Communities We&apos;ve Built
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-stone-700">
            A growing portfolio of villa communities across Maharashtra and Karnataka — each one delivered on the
            same promise of craftsmanship and care.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {preview.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} size="compact" />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-12"
        >
          <Link
            href="/projects"
            className="inline-block rounded-full bg-clay-500 px-8 py-4 text-sm font-semibold text-stone-50 transition-colors hover:bg-clay-600"
          >
            View All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
