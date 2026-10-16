"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/data/projects";

interface ProjectCardProps {
  project: Project;
  index?: number;
  size?: "default" | "compact";
}

/** The project card used on the /projects grid, the home teaser, and "Similar Projects". */
export function ProjectCard({ project, index = 0, size = "default" }: ProjectCardProps) {
  const imageHeight = size === "compact" ? "h-48" : "h-64";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group block h-full overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-sm transition-shadow hover:shadow-lg"
      >
        <div className={`relative w-full overflow-hidden ${imageHeight}`}>
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-forest-950/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-stone-50 backdrop-blur-sm">
            {project.status}
          </span>
        </div>
        <div className={size === "compact" ? "p-5" : "p-6"}>
          <h3 className={`font-display font-medium text-forest-950 ${size === "compact" ? "text-lg" : "text-xl"}`}>
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-stone-600">{project.location}</p>
          {size === "default" && project.villaCount && (
            <p className="mt-3 text-sm font-medium text-clay-600">{project.villaCount} Villas</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
