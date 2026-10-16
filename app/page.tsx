import { HeroScrollSection } from "@/components/sections/HeroScrollSection";
import { ProjectsTeaserSection } from "@/components/sections/ProjectsTeaserSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { EnquiryCTASection } from "@/components/sections/EnquiryCTASection";

export default function Home() {
  return (
    <main>
      <HeroScrollSection />
      <ProjectsTeaserSection />
      <TestimonialsSection />
      <FAQSection />
      <EnquiryCTASection />
    </main>
  );
}
