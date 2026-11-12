import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileEnquireButton } from "@/components/layout/MobileEnquireButton";
import { IntroSplash } from "@/components/splash/IntroSplash";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Great Nature Homes | Premium Villa Construction & Real Estate",
  description:
    "Great Nature Homes builds premium villas set in nature — 100+ villas delivered, resort-grade amenities, and a build process designed around you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body>
        {/* Must run before the browser restores scroll on reload, which can
            happen before React hydrates — a beforeInteractive inline script
            is the earliest hook Next.js offers. Without this, IntroSplash's
            own reload-handling effect runs too late on a slow-loading page
            (the splash video delays `load`) and the browser's own scroll
            restoration wins the race. */}
        <Script id="disable-scroll-restoration" strategy="beforeInteractive">
          {"try{if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}"}
        </Script>
        <IntroSplash />
        <SmoothScrollProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <MobileEnquireButton />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
