/**
 * Shared shapes for the concierge chat — used by both the /api/chat route
 * (which emits them) and the client widget (which renders them).
 */

export type ChatWidget =
  | { kind: "projects"; slugs: string[] }
  | { kind: "location"; slug: string }
  | { kind: "compare"; slugs: string[] }
  | { kind: "enquiry"; projectSlug?: string; note?: string }
  | { kind: "contact" };

/** One line of the NDJSON stream sent by /api/chat. */
export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | { type: "widget"; widget: ChatWidget }
  | { type: "suggestions"; items: string[] }
  | { type: "error"; message: string }
  | { type: "done" };

/** What the client sends as history: plain text only, widgets summarised. */
export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestBody {
  messages: ChatHistoryMessage[];
  /** The page the visitor is on, so answers can be context-aware. */
  pathname?: string;
}

export function describeWidget(widget: ChatWidget): string {
  switch (widget.kind) {
    case "projects":
      return `[Showed project cards: ${widget.slugs.join(", ")}]`;
    case "location":
      return `[Showed map & location for: ${widget.slug}]`;
    case "compare":
      return `[Showed comparison of: ${widget.slugs.join(", ")}]`;
    case "enquiry":
      return `[Showed enquiry form${widget.projectSlug ? ` for ${widget.projectSlug}` : ""}]`;
    case "contact":
      return "[Showed contact options]";
  }
}
