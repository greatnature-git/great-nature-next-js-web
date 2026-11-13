"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "@/components/providers/SmoothScrollProvider";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const lenisRef = useLenis();
  // Project detail pages and the About page have their own in-page #enquiry
  // section; everywhere else, the enquiry form lives on the home page.
  const hasOwnEnquirySection = pathname.startsWith("/projects/") || pathname === "/about-us";
  const enquiryHref = hasOwnEnquirySection ? "#enquiry" : "/#enquiry";

  // Clicking a nav link to the page you're already on is a no-op navigation
  // — Next.js won't scroll you anywhere. Treat it as "take me back to the
  // top" instead, the same way clicking a logo/home link conventionally
  // does, on every page this header appears on.
  function handleNavClick(event: React.MouseEvent, href: string) {
    setMenuOpen(false);
    if (href !== pathname) return;
    event.preventDefault();
    const lenis = lenisRef?.current;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  useEffect(() => {
    const onScroll = () => setFade(Math.min(1, window.scrollY / FADE_DISTANCE));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change, and keep the body from scrolling
  // behind the open menu's overlay.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
        <Link href="/" onClick={(event) => handleNavClick(event, "/")} className="flex items-center">
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
              onClick={(event) => handleNavClick(event, link.href)}
              className="text-sm font-medium tracking-wide text-stone-50/90 transition-colors hover:text-clay-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={enquiryHref}
            onClick={(event) => handleNavClick(event, enquiryHref)}
            className="rounded-full bg-clay-500 px-5 py-2.5 text-sm font-semibold text-stone-50 shadow-sm transition-colors hover:bg-clay-600"
          >
            Enquire Now
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative flex h-10 w-10 flex-none items-center justify-center md:hidden"
          >
            <span
              className={`absolute h-[1.5px] w-5 bg-stone-50 transition-transform duration-300 ${
                menuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-stone-50 transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-stone-50 transition-transform duration-300 ${
                menuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-stone-50/10 bg-forest-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className="rounded-lg px-2 py-3 text-base font-medium tracking-wide text-stone-50/90 transition-colors hover:text-clay-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
