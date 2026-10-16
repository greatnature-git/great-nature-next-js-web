"use client";

import { motion } from "framer-motion";
import { PREVIOUS_PROJECTS } from "@/lib/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";

/** Up to 3 other projects, excluding the one currently being viewed. */
export function SimilarProjects({ excludeSlug }: { excludeSlug: string }) {
  const others = PREVIOUS_PROJECTS.filter((project) => project.slug !== excludeSlug).slice(0, 3);

  if (others.length === 0) return null;

  return (
    <section className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Explore More</span>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
            Similar Communities
          </h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {others.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} size="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
