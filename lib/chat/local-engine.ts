import { PREVIOUS_PROJECTS, type Project } from "@/lib/data/projects";
import { FAQS } from "@/lib/data/faqs";
import { TRUST_STATS } from "@/lib/data/stats";
import { ABOUT_MISSION, COMPANY_CONTACT, FOUNDER } from "@/lib/data/about";
import { CAREERS } from "@/lib/data/careers";
import { matchProjectsInText, projectFromPathname } from "@/lib/chat/knowledge";
import type { ChatHistoryMessage, ChatWidget } from "@/lib/chat/types";

/**
 * A deterministic, data-grounded responder used whenever no Claude API key
 * is configured (or the API is unreachable). It only ever answers from the
 * site's own data files, so it can't invent prices or availability.
 */

export interface LocalReply {
  text: string;
  widgets: ChatWidget[];
  suggestions: string[];
}

const has = (text: string, ...words: (string | RegExp)[]) =>
  words.some((w) => (typeof w === "string" ? text.includes(w) : w.test(text)));

function list(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

function specsLine(p: Project): string {
  return `**${p.specs.bhk}** · ${p.specs.area} · ${p.specs.floors} · ${p.specs.landParcel} plot`;
}

/** Most recent project the conversation was about — lets "where is it?" work as a follow-up. */
function projectFromHistory(history: ChatHistoryMessage[]): Project | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const found = matchProjectsInText(history[i].content);
    if (found.length === 1) return found[0];
    const slugMatch = PREVIOUS_PROJECTS.find((p) => history[i].content.includes(p.slug));
    if (slugMatch) return slugMatch;
  }
  return undefined;
}

const AMENITY_KEYWORDS: Record<string, string[]> = {
  pool: ["Private Pool"],
  swim: ["Private Pool"],
  solar: ["5KV Solar System"],
  gym: ["Club House with Gym", "Health Club"],
  fitness: ["Club House with Gym", "Health Club"],
  yoga: ["Yoga & Meditation", "Yoga and Meditation"],
  club: ["Club House", "Club House with Gym"],
  garden: ["Individual Landscaped Garden", "Hydroponics Vegetable Garden"],
  library: ["Mini Library"],
  security: ["CCTV Surveillance", "Centralized Security", "Camera Surveillance"],
  cctv: ["CCTV Surveillance", "Camera Surveillance"],
  kids: ["Children's Play Area"],
  children: ["Children's Play Area"],
  play: ["Children's Play Area"],
  well: ["Independent Well", "Natural Well Water"],
  parking: ["Guest Parking"],
  party: ["Open Party Area"],
};

export function localReply(history: ChatHistoryMessage[], pathname?: string): LocalReply {
  const last = history[history.length - 1]?.content ?? "";
  const q = last.toLowerCase().trim();
  const mentioned = matchProjectsInText(q);
  const pageProject = projectFromPathname(pathname);
  const contextual = mentioned[0] ?? projectFromHistory(history.slice(0, -1)) ?? pageProject;

  // --- Greetings / thanks -------------------------------------------------
  if (/^(hi|hello|hey|hai|good (morning|afternoon|evening)|namaste)\b/.test(q) && q.length < 30) {
    return {
      text: pageProject
        ? `Hello! 👋 I see you're looking at **${pageProject.name}** in ${pageProject.location}. I can share its specs, amenities, exact location, or arrange a site visit. What would you like to know?`
        : "Hello! 👋 I'm the Great Nature Homes concierge. I can walk you through our villa communities across Kochi, show their locations, compare options, or connect you with a consultant. How can I help?",
      widgets: [],
      suggestions: pageProject
        ? [`Amenities at ${pageProject.name}`, "Show the location", "Book a site visit"]
        : ["Show all projects", "Ongoing projects", "Villas near Infopark"],
    };
  }
  if (has(q, "thank", "thanks", "great", "awesome", "perfect") && q.length < 40) {
    return {
      text: "You're most welcome! If anything else comes to mind — pricing, site visits, or a specific community — I'm right here.",
      widgets: [],
      suggestions: ["Book a site visit", "Contact the team"],
    };
  }

  // --- Enquiry / site visit / callback -----------------------------------
  if (has(q, "enquir", "inquir", "site visit", "visit", "callback", "call back", "book", "schedule", "interested", "brochure", "contact me")) {
    return {
      text: contextual
        ? `Wonderful — I'll pass your interest in **${contextual.name}** straight to our villa consultants. Leave your details below and they'll reach out within one business day to arrange a visit.`
        : "I'd be glad to arrange that. Share your details below and one of our villa consultants will reach out within one business day.",
      widgets: [{ kind: "enquiry", projectSlug: contextual?.slug }],
      suggestions: ["Show all projects", "Contact the team"],
    };
  }

  // --- Price / budget ----------------------------------------------------
  if (has(q, "price", "cost", "budget", "rate", "how much", "lakh", "crore", " cr", "₹", "loan", "emi", "payment")) {
    const faq = FAQS.find((f) => f.question.toLowerCase().includes("budget"));
    return {
      text: `${faq?.answer ?? ""}\n\nPricing depends on the villa, plot and current availability${contextual ? ` at **${contextual.name}**` : ""}, so our consultants share an exact quote personally. Drop your details and budget below and they'll send it over.`,
      widgets: [{ kind: "enquiry", projectSlug: contextual?.slug, note: "Pricing request" }],
      suggestions: ["Compare projects", "Ongoing projects"],
    };
  }

  // --- Comparison --------------------------------------------------------
  if (has(q, "compare", "comparison", " vs", "versus", "difference", "better")) {
    // "Compare these" → the projects shown in the previous reply.
    const previous = history
      .slice(0, -1)
      .reverse()
      .find((m) => m.role === "assistant")
      ?.content.match(/\[Showed (?:project cards|comparison of): ([^\]]+)\]/)?.[1]
      .split(", ");
    const slugs =
      mentioned.length >= 2
        ? mentioned.map((p) => p.slug)
        : previous && previous.length >= 2
          ? previous
          : PREVIOUS_PROJECTS.map((p) => p.slug);
    slugs.splice(4);
    return {
      text:
        mentioned.length >= 2 || (previous && previous.length >= 2 && has(q, "these", "them", "those"))
          ? `Here's a side-by-side look at **${slugs.map((s) => PREVIOUS_PROJECTS.find((p) => p.slug === s)?.name).join("**, **")}**.`
          : "Here's how our communities compare at a glance. Name any two (e.g. *compare Greenock and Mexican*) for a focused view.",
      widgets: [{ kind: "compare", slugs }],
      suggestions: ["Which has a private pool?", "Book a site visit"],
    };
  }

  // --- Location / map ----------------------------------------------------
  if (has(q, "where", "location", "locat", "map", "direction", "address", "how to reach", "route", "nearby", "near by", "distance")) {
    if (contextual) {
      return {
        text: `**${contextual.name}** is located in **${contextual.location}**.\n\nNearby:\n${list(contextual.nearby.map((n) => `${n.name} — ${n.distance}`))}`,
        widgets: [{ kind: "location", slug: contextual.slug }],
        suggestions: [`Amenities at ${contextual.name}`, "Book a site visit", "Show other projects"],
      };
    }
  }

  // --- "Near X" landmark search -----------------------------------------
  const landmark = ["infopark", "smartcity", "smart city", "wonderla", "civil station", "airport", "aluva", "edapally", "kakkanad", "pallikkara", "athani"].find((l) => q.includes(l));
  if (landmark && !mentioned.length) {
    const hits = PREVIOUS_PROJECTS.filter(
      (p) =>
        p.location.toLowerCase().includes(landmark) ||
        p.nearby.some((n) => n.name.toLowerCase().replace(/\s/g, "").includes(landmark.replace(/\s/g, ""))),
    );
    if (hits.length) {
      return {
        text: `These communities are close to **${landmark.replace(/\b\w/g, (c) => c.toUpperCase())}**:\n${list(
          hits.map((p) => {
            const near = p.nearby.find((n) => n.name.toLowerCase().replace(/\s/g, "").includes(landmark.replace(/\s/g, "")));
            return `**${p.name}** — ${near ? `${near.distance} from ${near.name}` : p.location}`;
          }),
        )}`,
        widgets: [{ kind: "projects", slugs: hits.map((p) => p.slug) }],
        suggestions: ["Compare these", "Book a site visit"],
      };
    }
  }

  // --- Amenity search ----------------------------------------------------
  const amenityKey = Object.keys(AMENITY_KEYWORDS).find((k) => q.includes(k));
  if (amenityKey && !(mentioned.length === 1 && has(q, "amenit", "facilit"))) {
    const wanted = AMENITY_KEYWORDS[amenityKey];
    const pool = mentioned.length ? mentioned : PREVIOUS_PROJECTS;
    const hits = pool.filter((p) => p.amenities.some((a) => wanted.includes(a)));
    if (hits.length) {
      return {
        text: `Communities offering **${wanted[0].toLowerCase()}**:\n${list(hits.map((p) => `**${p.name}** — ${p.location}`))}`,
        widgets: [{ kind: "projects", slugs: hits.map((p) => p.slug) }],
        suggestions: hits.length > 1 ? ["Compare these", "Book a site visit"] : [`Where is ${hits[0].name}?`, "Book a site visit"],
      };
    }
    return {
      text: `None of our current listings explicitly mention ${amenityKey}, but every community can be discussed with our consultants — many specifics are customisable.`,
      widgets: [{ kind: "enquiry", note: `Asked about ${amenityKey}` }],
      suggestions: ["Show all projects"],
    };
  }

  // --- BHK filter --------------------------------------------------------
  const bhk = q.match(/([2-5])\s*-?\s*(bhk|bed|bedroom)/);
  if (bhk) {
    const hits = PREVIOUS_PROJECTS.filter((p) => p.specs.bhk.includes(bhk[1]));
    return hits.length
      ? {
          text: `Communities with **${bhk[1]} BHK** villas:\n${list(hits.map((p) => `**${p.name}** — ${p.specs.area}, ${p.location}`))}`,
          widgets: [{ kind: "projects", slugs: hits.map((p) => p.slug) }],
          suggestions: ["Compare these", "Book a site visit"],
        }
      : {
          text: `We don't currently list ${bhk[1]} BHK villas, but our consultants can talk you through custom options.`,
          widgets: [{ kind: "enquiry", note: `${bhk[1]} BHK request` }],
          suggestions: ["Show all projects"],
        };
  }

  // --- Status filters ----------------------------------------------------
  if (has(q, "ongoing", "available", "under construction", "current", "new launch", "upcoming", "ready")) {
    const wantCompleted = has(q, "ready", "completed");
    const hits = PREVIOUS_PROJECTS.filter((p) => p.status === (wantCompleted ? "Completed" : "Ongoing"));
    return {
      text: `${wantCompleted ? "Completed" : "Ongoing"} communities:\n${list(hits.map((p) => `**${p.name}** — ${p.location}`))}`,
      widgets: [{ kind: "projects", slugs: hits.map((p) => p.slug) }],
      suggestions: ["Compare projects", "Book a site visit"],
    };
  }
  if (has(q, "completed", "delivered", "finished", "past project", "previous")) {
    const hits = PREVIOUS_PROJECTS.filter((p) => p.status === "Completed");
    return {
      text: `We've delivered ${TRUST_STATS.find((s) => s.label.includes("Homes"))?.value ?? 100}+ homes. Completed communities include:\n${list(hits.map((p) => `**${p.name}** — ${p.location}`))}`,
      widgets: [{ kind: "projects", slugs: hits.map((p) => p.slug) }],
      suggestions: ["Ongoing projects", "About the company"],
    };
  }

  // --- A specific project ------------------------------------------------
  if (contextual && (mentioned.length === 1 || has(q, "amenit", "facilit", "feature", "spec", "size", "sq", "area", "bhk", "detail", "tell me", "about it", "this project", "floor", "plot", "cent"))) {
    const p = contextual;
    if (has(q, "amenit", "facilit", "feature")) {
      return {
        text: `**${p.name}** amenities:\n${list(p.amenities)}`,
        widgets: [],
        suggestions: [`Where is ${p.name}?`, "Book a site visit", "Compare projects"],
      };
    }
    return {
      text: `**${p.name}** — *${p.tagline}*\n\n${p.description[0]}\n\n${specsLine(p)}${p.villaCount ? ` · ${p.villaCount} villas` : ""}\n\nStatus: **${p.status}** · ${p.location}`,
      widgets: [{ kind: "projects", slugs: [p.slug] }],
      suggestions: [`Amenities at ${p.name}`, `Where is ${p.name}?`, "Book a site visit"],
    };
  }

  // --- All projects ------------------------------------------------------
  if (has(q, "project", "villa", "propert", "home", "house", "communit", "listing", "options", "show all")) {
    return {
      text: `We have **${PREVIOUS_PROJECTS.length} villa communities** across Kochi's greenest residential corridors. Swipe through them below — tap any card for full details or its location.`,
      widgets: [{ kind: "projects", slugs: PREVIOUS_PROJECTS.map((p) => p.slug) }],
      suggestions: ["Ongoing projects", "Villas with a private pool", "Compare projects"],
    };
  }

  // --- Company / FAQ -----------------------------------------------------
  if (has(q, "how long", "construction time", "timeline", "deliver", "possession", "handover")) {
    const faq = FAQS.find((f) => f.question.toLowerCase().includes("how long"));
    return { text: faq?.answer ?? "", widgets: [], suggestions: ["Show all projects", "Book a site visit"] };
  }
  if (has(q, "founder", "md", "ceo", "owner", "francis", "who runs")) {
    return {
      text: `Great Nature Homes is led by **${FOUNDER.name}**, ${FOUNDER.title} — ${FOUNDER.credentials.join(", ").toLowerCase()}.\n\n> ${FOUNDER.message[0]}`,
      widgets: [],
      suggestions: ["About the company", "Show all projects"],
    };
  }
  if (has(q, "about", "company", "who are you", "experience", "trust", "why choose", "eco", "sustainab", "green")) {
    return {
      text: `**Great Nature Homes** builds premium, nature-integrated villas across Kochi.\n\n${list(TRUST_STATS.map((s) => `**${s.value}${s.suffix}** ${s.label}`))}\n\n${ABOUT_MISSION}`,
      widgets: [],
      suggestions: ["Show all projects", "Who is the founder?", "Contact the team"],
    };
  }
  if (has(q, "career", "job", "hiring", "vacanc", "work with", "resume")) {
    return {
      text: `${CAREERS.paragraph}\n\n${CAREERS.note} You can email your resume to **${COMPANY_CONTACT.email}** or visit our [Careers page](/careers).`,
      widgets: [],
      suggestions: ["About the company"],
    };
  }
  if (has(q, "contact", "phone", "call", "number", "email", "mail", "whatsapp", "office", "talk", "human", "agent", "person")) {
    return {
      text: "Here's how to reach our team directly — or leave your details and we'll call you.",
      widgets: [{ kind: "contact" }],
      suggestions: ["Book a site visit", "Show all projects"],
    };
  }

  // --- Fallback ----------------------------------------------------------
  return {
    text: "I want to make sure I give you an accurate answer — I can help with our villa projects, their locations, amenities, comparisons, and site visits. For anything else, our consultants are a message away.",
    widgets: [{ kind: "contact" }],
    suggestions: ["Show all projects", "Villas near Infopark", "Book a site visit"],
  };
}
