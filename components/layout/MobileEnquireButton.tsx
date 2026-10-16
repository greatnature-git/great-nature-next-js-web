"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** A sticky mobile-only CTA that appears once the user has scrolled past the hero. */
export function MobileEnquireButton() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  // Project detail pages and the About page have their own in-page #enquiry
  // section; everywhere else, the enquiry form lives on the home page.
  const hasOwnEnquirySection = pathname.startsWith("/projects/") || pathname === "/about-us";
  const enquiryHref = hasOwnEnquirySection ? "#enquiry" : "/#enquiry";

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href={enquiryHref}
      className={`fixed inset-x-4 bottom-4 z-40 flex items-center justify-center rounded-full bg-clay-500 py-3.5 text-center text-sm font-semibold text-stone-50 shadow-lg shadow-forest-950/20 transition-all duration-300 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      Submit Enquiry
    </Link>
  );
}
