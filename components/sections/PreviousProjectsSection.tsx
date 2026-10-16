"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ScrollCinemaSection } from "@/components/scroll-cinema/ScrollCinemaSection";
import { PREVIOUS_PROJECTS, type Project } from "@/lib/data/projects";
import { useIsCoarseOrSmall } from "@/lib/hooks/useMediaQuery";

const PROJECTS_FRAME_COUNT = { desktop: 180, mobile: 90 };

function buildFrameUrls(base: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${base}/frame_${String(i + 1).padStart(4, "0")}.webp`);
}

export function PreviousProjectsSection() {
  const isMobile = useIsCoarseOrSmall();
  const frameUrls = useMemo(
    () =>
      buildFrameUrls(
        isMobile ? "/frames/projects-mobile" : "/frames/projects",
        isMobile ? PROJECTS_FRAME_COUNT.mobile : PROJECTS_FRAME_COUNT.desktop
      ),
    [isMobile]
  );

  return (
    <ScrollCinemaSection
      id="projects"
      heightVh={420}
      frameUrls={frameUrls}
      posterSrc="/projects-poster.jpg"
      fallbackVideoSrc="/videos/projects-fallback.mp4"
      loadingLabel="Loading previous projects"
    >
      {({ progress }) => (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-forest-950/50" />

          <div className="pointer-events-none absolute inset-x-0 top-16 flex flex-col items-center px-6 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-400">Previous Projects</span>
            <h2 className="mt-3 font-display text-3xl font-medium text-stone-50 sm:text-4xl">
              Communities We&apos;ve Built
            </h2>
          </div>

          <div className="absolute inset-x-0 bottom-8 grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-10">
            {PREVIOUS_PROJECTS.map((project, index) => (
              <ProjectCard
                key={project.name}
                project={project}
                index={index}
                total={PREVIOUS_PROJECTS.length}
                progress={progress}
              />
            ))}
          </div>
        </>
      )}
    </ScrollCinemaSection>
  );
}

function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = 0.2 + (index / total) * 0.55;
  const end = start + 0.14;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [24, 0]);

  return (
    <Link href={`/projects/${project.slug}`} className="block h-full">
      <motion.div
        style={{ opacity, y }}
        className="overflow-hidden rounded-xl border border-stone-50/10 bg-stone-50/10 backdrop-blur-sm transition-colors hover:border-stone-50/25"
      >
        <div className="relative h-20 w-full sm:h-32">
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
        <div className="p-2.5 sm:p-3.5">
          <h3 className="truncate text-xs font-semibold text-stone-50 sm:text-sm">{project.name}</h3>
          <p className="truncate text-[11px] text-stone-200/80 sm:text-xs">{project.location}</p>
          {project.villaCount && (
            <p className="mt-1 text-[11px] font-medium text-clay-400 sm:text-xs">{project.villaCount} Villas</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
