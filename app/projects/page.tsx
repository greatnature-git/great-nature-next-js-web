import type { Metadata } from "next";
import { PreviousProjectsSection } from "@/components/sections/PreviousProjectsSection";
import { ProjectsListingSection } from "@/components/sections/ProjectsListingSection";

export const metadata: Metadata = {
  title: "Our Projects | Great Nature Homes",
  description:
    "Explore the villa communities Great Nature Homes has delivered — browse completed projects by location and villa count.",
};

export default function ProjectsPage() {
  return (
    <main>
      <PreviousProjectsSection />
      <ProjectsListingSection />
    </main>
  );
}
