"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/data/projects";

/** Description copy plus a row of indicative spec tiles (ranges, not invented exact figures). */
export function ProjectOverview({ project }: { project: Project }) {
  const tiles = [
    { value: project.specs.bhk, label: "Configuration" },
    { value: project.specs.area, label: "Built-up Area" },
    { value: project.specs.floors, label: "Floors" },
    { value: project.specs.landParcel, label: "Land Parcel" },
    ...(project.villaCount
      ? [{ value: `${project.villaCount}`, label: project.status === "Ongoing" ? "Villas Planned" : "Villas" }]
      : []),
  ];

  return (
    <section className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Overview</span>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
            About {project.name}
          </h2>
          <div className="mt-5 space-y-4 text-stone-700">
            {project.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-forest-900/10 pt-10 text-center sm:grid-cols-4"
        >
          {tiles.map((tile) => (
            <div key={tile.label}>
              <p className="font-display text-xl text-clay-600 sm:text-2xl">{tile.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{tile.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
