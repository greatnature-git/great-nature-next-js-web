import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PREVIOUS_PROJECTS, getProjectBySlug } from "@/lib/data/projects";
import { ProjectHero } from "@/components/project-detail/ProjectHero";
import { ProjectGallery } from "@/components/project-detail/ProjectGallery";
import { ProjectOverview } from "@/components/project-detail/ProjectOverview";
import { ProjectAmenities } from "@/components/project-detail/ProjectAmenities";
import { ProjectLocationMap } from "@/components/project-detail/ProjectLocationMap";
import { SimilarProjects } from "@/components/project-detail/SimilarProjects";
import { EnquiryCTASection } from "@/components/sections/EnquiryCTASection";

export function generateStaticParams() {
  return PREVIOUS_PROJECTS.map((project) => ({ slug: project.slug }));
}

// Every section on this page is specific to the project at this URL (name,
// photos, specs, location) — there's no shared shell worth prefetching
// separately from it, so this route is allowed to block on navigation
// instead of being split behind an artificial Suspense skeleton.
export const instant = false;

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.name} | Great Nature Homes`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <main>
      <ProjectHero project={project} />
      <ProjectGallery images={project.gallery} alt={project.name} />
      <ProjectOverview project={project} />
      <ProjectAmenities amenities={project.amenities} />
      <ProjectLocationMap location={project.location} nearby={project.nearby} mapQuery={project.mapQuery} />
      <SimilarProjects excludeSlug={project.slug} />
      <EnquiryCTASection
        heading={`Enquire About ${project.name}`}
        subheading="Share a few details and one of our villa consultants will walk you through availability, pricing, and next steps."
        showStats={false}
        defaultLocation={project.location}
        defaultMessage={`I'm interested in ${project.name}.`}
      />
    </main>
  );
}
