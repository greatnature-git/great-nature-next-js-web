import type { FeatureCallout } from "@/components/scroll-cinema/FeatureCallouts";

// Titles and timing are matched to what's actually on screen at each beat of
// the hero walkthrough (entry -> living room -> primary suite -> kitchen),
// so the callout a viewer reads always matches the room they're looking at.
export const HERO_FEATURES: FeatureCallout[] = [
  { title: "100+ Villas Delivered", caption: "A decade of craftsmanship, handed over on time, every time." },
  { title: "Premium Interiors", caption: "Curated finishes and fixtures, down to the fireplace surround." },
  { title: "Serene Primary Suites", caption: "Private bedrooms framed by natural light and garden views." },
  { title: "Open, Connected Living", caption: "Bedrooms, living spaces, and the kitchen, seamlessly linked." },
  { title: "Chef-Grade Kitchens", caption: "Integrated appliances and full-height cabinetry in every home." },
  { title: "Islands Built to Gather Around", caption: "Oversized marble islands designed for entertaining, not just cooking." },
  { title: "Every Detail, Considered", caption: "From fittings to finishes, nothing is an afterthought." },
];
