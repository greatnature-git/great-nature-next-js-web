"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PREVIOUS_PROJECTS } from "@/lib/data/projects";
import { TRUST_STATS } from "@/lib/data/stats";
import { ProjectCard } from "@/components/projects/ProjectCard";

/** The full project portfolio, with trust stats, shown on the dedicated /projects page. */
export function ProjectsListingSection() {
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
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Our Portfolio</span>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-forest-950 sm:text-5xl">
            Every Community We&apos;ve Delivered
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-stone-700">
            From hillside retreats to coastal estates, each Great Nature Homes community is built on the same
            foundation: considered architecture, honest craftsmanship, and homes delivered on schedule.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-8 text-center sm:max-w-none sm:grid-cols-4"
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl text-clay-600 sm:text-4xl">
                {stat.value}
                {stat.suffix}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {PREVIOUS_PROJECTS.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-16 text-center"
        >
          <Link
            href="/#enquiry"
            className="inline-block rounded-full bg-clay-500 px-8 py-4 text-sm font-semibold text-stone-50 transition-colors hover:bg-clay-600"
          >
            Enquire About a Project
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
