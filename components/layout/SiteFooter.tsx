import Link from "next/link";
import { PREVIOUS_PROJECTS } from "@/lib/data/projects";
import { COMPANY_CONTACT } from "@/lib/data/about";

const QUICK_LINKS = [
  { href: "/#hero", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/#enquiry", label: "Contact" },
];

const linkClass = "text-left transition-colors hover:text-clay-400";

/** The global site footer — same forest tone as the enquiry CTA every page ends on, so the dark close reads as one beat, not a jarring snap back to light. */
export function SiteFooter() {
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_CONTACT.address)}`;

  return (
    <footer className="border-t border-stone-50/10 bg-forest-900 px-6 pb-8 pt-16 sm:px-10 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <span className="font-display text-xl font-semibold tracking-tight text-stone-50">
              Great Nature Homes
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-300/80">
              Premium villas and communities built to coexist with nature — considered architecture, honest
              craftsmanship, and sustainable construction from groundbreaking to handover.
            </p>
          </div>

          <FooterColumn title="Quick Links">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Featured Projects">
            {PREVIOUS_PROJECTS.map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className={linkClass}>
                {project.name}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact Us">
            <a href={`tel:${COMPANY_CONTACT.phone}`} className={linkClass}>
              {COMPANY_CONTACT.phone}
            </a>
            <a href={`mailto:${COMPANY_CONTACT.email}`} className={linkClass}>
              {COMPANY_CONTACT.email}
            </a>
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {COMPANY_CONTACT.address}
            </a>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone-50/10 pt-8 text-xs text-stone-400 sm:flex-row">
          <p>© 2026 Great Nature Homes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-clay-400">{title}</h3>
      <div className="mt-5 flex flex-col items-start gap-3 text-sm text-stone-300/80">{children}</div>
    </div>
  );
}
