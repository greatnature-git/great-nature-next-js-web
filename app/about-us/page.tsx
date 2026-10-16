import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutFeatures } from "@/components/about/AboutFeatures";
import { AboutFounder } from "@/components/about/AboutFounder";
import { EnquiryCTASection } from "@/components/sections/EnquiryCTASection";

export const metadata: Metadata = {
  title: "About Us | Great Nature Homes",
  description:
    "Great Nature Homes builds villas and communities that coexist with nature — learn about our mission, our approach to sustainable construction, and the team behind it.",
};

export default function AboutUsPage() {
  return (
    <main>
      <AboutHero />
      <AboutIntro />
      <AboutFeatures />
      <AboutFounder />
      <EnquiryCTASection
        heading="Let's Make Your Dream Home a Reality"
        subheading="A home is more than walls and a roof — it's where life breathes. Every project we craft blends modern architecture with greenery, so you live surrounded by peace, comfort, and freshness every day. Our team is here to guide you, every step of the way."
      />
    </main>
  );
}
