import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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
