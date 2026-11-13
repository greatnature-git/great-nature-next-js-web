import { PREVIOUS_PROJECTS, type Project } from "@/lib/data/projects";
import { FAQS } from "@/lib/data/faqs";
import { TRUST_STATS } from "@/lib/data/stats";
import { ABOUT_FEATURES, ABOUT_INTRO, ABOUT_MISSION, ABOUT_VISION, COMPANY_CONTACT, FOUNDER } from "@/lib/data/about";
import { CAREERS } from "@/lib/data/careers";

/**
 * Everything the concierge is allowed to know, built from the same data
 * files that render the website — so the chat can never drift out of sync
 * with what the pages themselves say.
 */

export const PROJECT_SLUGS = PREVIOUS_PROJECTS.map((p) => p.slug);

export function findProject(slug: string): Project | undefined {
  return PREVIOUS_PROJECTS.find((p) => p.slug === slug);
}

export function googleMapsSearchUrl(project: Project): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.name}, ${project.location}`)}`;
}

/** Normalised words that identify each project in free text. */
const PROJECT_ALIASES: Record<string, string[]> = {
  "greenock-villas": ["greenock", "green ock", "athani"],
  "mexican-bungalows": ["mexican", "mexico", "bungalow"],
  "scotland-yard-villa": ["scotland", "scotlandyard", "scotland yard"],
  "spanish-villa": ["spanish", "spain"],
  "rainwoods-villa": ["rainwoods", "rain woods", "rainwood"],
  "greencasa-villas": ["greencasa", "green casa", "casa"],
};

export function matchProjectsInText(text: string): Project[] {
  const lower = text.toLowerCase();
  return PREVIOUS_PROJECTS.filter((p) =>
    [p.name.toLowerCase(), ...(PROJECT_ALIASES[p.slug] ?? [])].some((alias) => lower.includes(alias)),
  );
}

export function projectFromPathname(pathname?: string): Project | undefined {
  const match = pathname?.match(/^\/projects\/([^/?#]+)/);
  return match ? findProject(match[1]) : undefined;
}

function projectToText(p: Project): string {
  return [
    `### ${p.name} (slug: ${p.slug})`,
    `- Location: ${p.location}`,
    `- Status: ${p.status}`,
    p.villaCount ? `- Number of villas: ${p.villaCount}` : null,
    `- Tagline: ${p.tagline}`,
    `- Configuration: ${p.specs.bhk}, ${p.specs.area} built-up, ${p.specs.floors}, ${p.specs.landParcel} land per villa`,
    `- Amenities: ${p.amenities.join(", ")}`,
    `- Nearby: ${p.nearby.map((n) => `${n.name} (${n.distance})`).join(", ")}`,
    `- Page: /projects/${p.slug}`,
    `- Description: ${p.description.join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildKnowledgeBase(): string {
  return [
    "## Company",
    `Name: Great Nature Homes — premium villa builder in Kochi, Kerala.`,
    ABOUT_INTRO.paragraphs.join(" "),
    `Mission: ${ABOUT_MISSION}`,
    `Vision: ${ABOUT_VISION}`,
    `Key numbers: ${TRUST_STATS.map((s) => `${s.value}${s.suffix} ${s.label}`).join("; ")}.`,
    `What sets us apart: ${ABOUT_FEATURES.map((f) => `${f.title} — ${f.description}`).join(" ")}`,
    `Founder: ${FOUNDER.name}, ${FOUNDER.title} (${FOUNDER.credentials.join(", ")}). ${FOUNDER.message[0]}`,
    `Contact: phone ${COMPANY_CONTACT.phone}, email ${COMPANY_CONTACT.email}, office ${COMPANY_CONTACT.address}.`,
    `Careers: ${CAREERS.paragraph} ${CAREERS.note} (page: /careers)`,
    "",
    "## Projects",
    ...PREVIOUS_PROJECTS.map(projectToText),
    "",
    "## FAQs",
    ...FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
  ].join("\n");
}
