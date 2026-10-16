import type { Metadata } from "next";
import { CareersHero } from "@/components/careers/CareersHero";
import { CareersContent } from "@/components/careers/CareersContent";

export const metadata: Metadata = {
  title: "Careers | Great Nature Homes",
  description: "Join the team behind Great Nature Homes — a family of passionate, skilled people building real homes.",
};

export default function CareersPage() {
  return (
    <main>
      <CareersHero />
      <CareersContent />
    </main>
  );
}
