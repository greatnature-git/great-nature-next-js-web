"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/#enquiry", label: "Contact" },
];

/** Distance (px) over which the header fades from transparent to frosted glass. */
const FADE_DISTANCE = 140;

export function SiteHeader() {
  // A continuous 0-1 value rather than a boolean breakpoint, so the header
  // eases into its frosted state instead of snapping. The whole page is
  // dark/cinematic end to end (hero, projects, and the CTA are all forest
  // tones), so the header stays dark-glass throughout rather than flipping
  // to a light bar that would clash with every section it sits over.
  const [fade, setFade] = useState(0);
  const pathname = usePathname();
  // Project detail pages and the About page have their own in-page #enquiry
  // section; everywhere else, the enquiry form lives on the home page.
  const hasOwnEnquirySection = pathname.startsWith("/projects/") || pathname === "/about-us";
  const enquiryHref = hasOwnEnquirySection ? "#enquiry" : "/#enquiry";

  useEffect(() => {
    const onScroll = () => setFade(Math.min(1, window.scrollY / FADE_DISTANCE));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        backgroundColor: `rgba(17, 25, 15, ${0.72 * fade})`,
        borderBottom: `1px solid rgba(247, 243, 236, ${0.14 * fade})`,
        boxShadow: `0 8px 24px rgba(8, 12, 7, ${0.25 * fade})`,
        backdropFilter: fade > 0.05 ? "blur(16px)" : "none",
        WebkitBackdropFilter: fade > 0.05 ? "blur(16px)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-wordmark.png"
            alt="Great Nature Homes"
            width={800}
            height={494}
            className="h-12 w-auto object-contain sm:h-14"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-stone-50/90 transition-colors hover:text-clay-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={enquiryHref}
          className="rounded-full bg-clay-500 px-5 py-2.5 text-sm font-semibold text-stone-50 shadow-sm transition-colors hover:bg-clay-600"
        >
          Enquire Now
        </Link>
      </div>
    </header>
  );
}
