import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildKnowledgeBase, PROJECT_SLUGS, projectFromPathname } from "@/lib/chat/knowledge";
import type { ChatHistoryMessage, ChatStreamEvent, ChatWidget } from "@/lib/chat/types";

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";

const SYSTEM_PROMPT = `You are the digital concierge for Great Nature Homes, a premium villa builder in Kochi, Kerala. You chat with visitors on the company website.

Your job: answer questions about the company and its villa communities accurately and warmly, help visitors find the right home, and turn genuine interest into an enquiry or site visit.

Ground rules:
- Answer only from the knowledge base below. If something isn't covered (exact prices, current availability, unit numbers, loan specifics, legal approvals), say a consultant will confirm it and offer the enquiry form. Never invent numbers, prices, dates, or amenities.
- Off-topic requests: politely steer back to homes and the company in one sentence.
- Style: concise and premium — usually 2–5 short sentences or a tight bullet list. Use **bold** for project names and key figures. Markdown links only to site pages listed in the knowledge base (e.g. [Greenock Villas](/projects/greenock-villas)). No headings, no tables (use compare_projects for comparisons).
- Reply in the visitor's language if they write in Malayalam, Hindi, etc.

Display tools — they render rich cards under your message:
- Write your full text reply FIRST, then call the display tools as the very last step. Text written after a tool call is not shown.
- show_projects: whenever you recommend or discuss specific projects (1–6 slugs).
- show_location: when asked where a project is, directions, map, or what's nearby.
- compare_projects: when comparing two or more projects.
- show_enquiry_form: when the visitor wants a site visit, callback, brochure, pricing, or shows buying intent. Pre-select the project if one is in focus.
- show_contact: when they ask for phone, email, WhatsApp, or a human.
- suggest_followups: ALWAYS call this once at the end with 2–3 short follow-up questions the visitor might tap next (max 6 words each, written from the visitor's point of view).

# Knowledge base

${buildKnowledgeBase()}`;

const slugEnum = { type: "string", enum: PROJECT_SLUGS } as const;

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "show_projects",
    description: "Show visual project cards (photo, specs, links) for the given projects.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { slugs: { type: "array", items: slugEnum } },
      required: ["slugs"],
      additionalProperties: false,
    },
  },
  {
    name: "show_location",
    description: "Show an interactive Google Map, address and nearby landmarks for one project.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { slug: slugEnum },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "compare_projects",
    description: "Show a side-by-side comparison table of 2–4 projects.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { slugs: { type: "array", items: slugEnum } },
      required: ["slugs"],
      additionalProperties: false,
    },
  },
  {
    name: "show_enquiry_form",
    description: "Show an inline enquiry / site-visit form that sends the lead to the sales team.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        project_slug: { anyOf: [slugEnum, { type: "null" }], description: "Project to pre-select, or null." },
        note: { type: ["string", "null"], description: "Short context to prefill the message, e.g. 'Site visit request'." },
      },
      required: ["project_slug", "note"],
      additionalProperties: false,
    },
  },
  {
    name: "show_contact",
    description: "Show call, WhatsApp and email buttons for the sales team.",
    strict: true,
    input_schema: { type: "object", properties: {}, required: [], additionalProperties: false },
  },
  {
    name: "suggest_followups",
    description: "Offer 2–3 tappable follow-up questions under your reply.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { items: { type: "array", items: { type: "string" } } },
      required: ["items"],
      additionalProperties: false,
    },
  },
];

const slugSchema = z.enum(PROJECT_SLUGS as [string, ...string[]]);
const toolInputSchemas = {
  show_projects: z.object({ slugs: z.array(slugSchema).min(1).max(6) }),
  show_location: z.object({ slug: slugSchema }),
  compare_projects: z.object({ slugs: z.array(slugSchema).min(2).max(4) }),
  show_enquiry_form: z.object({ project_slug: slugSchema.nullable(), note: z.string().max(200).nullable() }),
  show_contact: z.object({}),
  suggest_followups: z.object({ items: z.array(z.string().max(80)).max(4) }),
};

type ToolOutcome = { widget?: ChatWidget; suggestions?: string[] } | { error: string };

function runDisplayTool(name: string, input: unknown): ToolOutcome {
  const schema = toolInputSchemas[name as keyof typeof toolInputSchemas];
  if (!schema) return { error: `Unknown tool ${name}` };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };
  const data = parsed.data as Record<string, unknown>;
  switch (name) {
    case "show_projects":
      return { widget: { kind: "projects", slugs: data.slugs as string[] } };
    case "show_location":
      return { widget: { kind: "location", slug: data.slug as string } };
    case "compare_projects":
      return { widget: { kind: "compare", slugs: data.slugs as string[] } };
    case "show_enquiry_form":
      return {
        widget: {
          kind: "enquiry",
          projectSlug: (data.project_slug as string | null) ?? undefined,
          note: (data.note as string | null) ?? undefined,
        },
      };
    case "show_contact":
      return { widget: { kind: "contact" } };
    case "suggest_followups":
      return { suggestions: data.items as string[] };
  }
  return { error: "Unhandled tool" };
}

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * Streams a Claude reply as ChatStreamEvents. Display tools are UI-only, so
 * a single round is normally enough; a second round runs only when the
 * model called tools before writing any visible text.
 */
export async function streamClaudeReply(
  history: ChatHistoryMessage[],
  pathname: string | undefined,
  emit: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const pageProject = projectFromPathname(pathname);
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((m, i) => {
    const isLast = i === history.length - 1;
    const context =
      isLast && m.role === "user"
        ? `[Visitor is on page: ${pathname ?? "/"}${pageProject ? ` — the ${pageProject.name} project page` : ""}]\n\n`
        : "";
    return { role: m.role, content: context + m.content };
  });

  let wroteText = false;

  for (let round = 0; round < 2; round++) {
    const stream = getClient().beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 4000,
        // Chat replies are short and latency-sensitive; low effort keeps them snappy.
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        messages,
      },
      { signal },
    );

    stream.on("text", (delta) => {
      wroteText = true;
      emit({ type: "text", delta });
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      if (!wroteText) emit({ type: "text", delta: "I'm not able to help with that here — but I'd be glad to tell you about our villa communities." });
      return;
    }
    // A max_tokens cut can leave a truncated tool input — don't act on it.
    if (message.stop_reason === "max_tokens") return;

    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (!toolUses.length) return;

    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((block) => {
      const outcome = runDisplayTool(block.name, block.input);
      if ("error" in outcome) {
        return { type: "tool_result", tool_use_id: block.id, is_error: true, content: outcome.error };
      }
      if (outcome.widget) emit({ type: "widget", widget: outcome.widget });
      if (outcome.suggestions?.length) emit({ type: "suggestions", items: outcome.suggestions });
      return { type: "tool_result", tool_use_id: block.id, content: "Displayed to the visitor." };
    });

    if (wroteText || message.stop_reason !== "tool_use") return;

    messages.push({ role: "assistant", content: message.content });
    messages.push({ role: "user", content: results });
  }
}
