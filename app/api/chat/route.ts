import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { isClaudeConfigured, streamClaudeReply } from "@/lib/chat/claude";
import { localReply } from "@/lib/chat/local-engine";
import type { ChatStreamEvent } from "@/lib/chat/types";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(40),
  pathname: z.string().max(200).optional(),
});

// Light per-IP throttle so the public endpoint can't be used to burn API
// credit. In-memory, so it's per server instance — good enough as a guard.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** Plays a local reply out word by word so it feels like the AI stream. */
async function emitLocal(
  messages: z.infer<typeof bodySchema>["messages"],
  pathname: string | undefined,
  emit: (e: ChatStreamEvent) => void,
) {
  const reply = localReply(messages, pathname);
  const tokens = reply.text.match(/\S+\s*|\s+/g) ?? [];
  for (const token of tokens) {
    emit({ type: "text", delta: token });
    await new Promise((r) => setTimeout(r, 18));
  }
  for (const widget of reply.widgets) emit({ type: "widget", widget });
  if (reply.suggestions.length) emit({ type: "suggestions", items: reply.suggestions });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many messages — please wait a moment." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { messages, pathname } = parsed.data;
  // Only the recent turns matter for a site concierge; keeps cost bounded.
  const history = messages.slice(-16);
  while (history[0]?.role !== "user") history.shift();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const emit = (event: ChatStreamEvent) => {
        if (!closed) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        if (isClaudeConfigured()) {
          let textSent = false;
          try {
            await streamClaudeReply(
              history,
              pathname,
              (e) => {
                if (e.type === "text") textSent = true;
                emit(e);
              },
              request.signal,
            );
          } catch (error) {
            if (request.signal.aborted) return;
            if (error instanceof Anthropic.AuthenticationError) {
              console.error("[chat] Anthropic API key rejected — falling back to local answers.");
            } else if (error instanceof Anthropic.RateLimitError) {
              console.warn("[chat] Anthropic rate limit hit — falling back to local answers.");
            } else if (error instanceof Anthropic.APIError) {
              console.error(`[chat] Anthropic API error ${error.status}:`, error.message);
            } else {
              console.error("[chat] unexpected error:", error);
            }
            // Never leave the visitor hanging: answer from site data instead.
            if (!textSent) await emitLocal(history, pathname, emit);
          }
        } else {
          await emitLocal(history, pathname, emit);
        }
        emit({ type: "done" });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
