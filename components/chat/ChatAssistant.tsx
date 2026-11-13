"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";
import { ChatWidgetView } from "@/components/chat/ChatWidgets";
import { projectFromPathname } from "@/lib/chat/knowledge";
import { describeWidget, type ChatStreamEvent, type ChatWidget } from "@/lib/chat/types";

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  widgets: ChatWidget[];
  suggestions: string[];
  status: "streaming" | "done" | "error";
  at: number;
}

const TEASER_KEY = "gn-concierge-teaser";
/** Other components can open the chat with: window.dispatchEvent(new CustomEvent("concierge:open", { detail: "optional question" })) */
export const OPEN_CHAT_EVENT = "concierge:open";

const uid = () => Math.random().toString(36).slice(2, 10);
const timeLabel = (at: number) => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function ChatAssistant() {
  const pathname = usePathname();
  const lenis = useLenis();
  const pageProject = projectFromPathname(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<UiMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // A gentle, once-per-session teaser bubble next to the launcher.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setTeaser(true), 9000);
    return () => clearTimeout(t);
  }, []);

  const dismissTeaser = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {}
  };

  // Pause page smooth-scroll while the full-screen mobile sheet is open.
  useEffect(() => {
    const isSmall = window.matchMedia("(max-width: 639px)").matches;
    if (!open || !isSmall) return;
    const instance = lenis?.current;
    instance?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      instance?.start();
      document.body.style.overflow = prev;
    };
  }, [open, lenis]);

  // Keep the newest content in view while streaming.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) {
      dismissTeaser();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  const updateMessage = (id: string, fn: (m: UiMessage) => UiMessage) =>
    setMessages((all) => all.map((m) => (m.id === id ? fn(m) : m)));

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setInput("");
      setConfirmClear(false);

      const userMsg: UiMessage = { id: uid(), role: "user", text, widgets: [], suggestions: [], status: "done", at: Date.now() };
      const botMsg: UiMessage = { id: uid(), role: "assistant", text: "", widgets: [], suggestions: [], status: "streaming", at: Date.now() };
      const history = [...messagesRef.current, userMsg]
        .filter((m) => m.status !== "error")
        .map((m) => ({
          role: m.role,
          content: [m.text, ...m.widgets.map(describeWidget)].filter(Boolean).join("\n") || "…",
        }));

      setMessages((all) => [...all.map((m) => ({ ...m, suggestions: [] })), userMsg, botMsg]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, pathname }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Request failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as ChatStreamEvent;
            if (event.type === "text") updateMessage(botMsg.id, (m) => ({ ...m, text: m.text + event.delta }));
            else if (event.type === "widget") updateMessage(botMsg.id, (m) => ({ ...m, widgets: [...m.widgets, event.widget] }));
            else if (event.type === "suggestions") updateMessage(botMsg.id, (m) => ({ ...m, suggestions: event.items.slice(0, 3) }));
          }
        }
        updateMessage(botMsg.id, (m) => ({ ...m, status: "done" }));
      } catch (error) {
        if (controller.signal.aborted) {
          updateMessage(botMsg.id, (m) => ({ ...m, status: "done", text: m.text || "_Stopped._" }));
        } else {
          updateMessage(botMsg.id, (m) => ({
            ...m,
            status: "error",
            text: error instanceof Error && error.message.includes("Too many") ? error.message : "I couldn't connect just now. Please try again — or reach our team directly.",
            widgets: [{ kind: "contact" }],
          }));
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, pathname],
  );

  // Let any page element open the concierge, optionally with a question.
  useEffect(() => {
    const handler = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string | undefined>).detail;
      if (typeof q === "string" && q) setTimeout(() => send(q), 300);
    };
    window.addEventListener(OPEN_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
  }, [send]);

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setConfirmClear(false);
    inputRef.current?.focus();
  };

  const onNavigate = () => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  };

  const quickActions = pageProject
    ? [
        { icon: "✦", title: "Project overview", sub: pageProject.name, q: `Tell me about ${pageProject.name}` },
        { icon: "◎", title: "Location & nearby", sub: pageProject.location.split(",")[0], q: `Where is ${pageProject.name} located?` },
        { icon: "❖", title: "Amenities", sub: `${pageProject.amenities.length} features`, q: `What amenities does ${pageProject.name} have?` },
        { icon: "◷", title: "Book a site visit", sub: "Talk to a consultant", q: `I'd like to book a site visit to ${pageProject.name}` },
      ]
    : [
        { icon: "✦", title: "Explore projects", sub: "6 villa communities", q: "Show me all your projects" },
        { icon: "◎", title: "Near Infopark", sub: "Find by location", q: "Which villas are near Infopark?" },
        { icon: "⇄", title: "Compare villas", sub: "Side by side", q: "Compare your projects" },
        { icon: "◷", title: "Book a site visit", sub: "Talk to a consultant", q: "I'd like to book a site visit" },
      ];

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <>
      {/* ---------------- Launcher ---------------- */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed bottom-20 right-4 z-[45] flex items-end gap-3 md:bottom-6 md:right-6"
          >
            <AnimatePresence>
              {teaser && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.95 }}
                  className="relative mb-2 hidden max-w-[220px] rounded-2xl rounded-br-md border border-forest-900/10 bg-white px-4 py-3 shadow-xl shadow-forest-950/10 sm:block"
                >
                  <button
                    type="button"
                    onClick={dismissTeaser}
                    aria-label="Dismiss"
                    className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[10px] text-stone-700 hover:bg-stone-300"
                  >
                    ✕
                  </button>
                  <p className="text-[13px] font-semibold text-forest-950">Have a question? 🌿</p>
                  <p className="mt-0.5 text-xs leading-snug text-stone-500">
                    {pageProject ? `Ask me anything about ${pageProject.name}.` : "Ask me about villas, locations or site visits."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open chat assistant"
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-forest-700 via-forest-900 to-forest-950 text-stone-50 shadow-[0_12px_32px_-8px_rgba(17,25,15,0.65)] ring-1 ring-white/10 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-clay-400/30 [animation-duration:3s]" />
              <span className="absolute inset-[3px] rounded-full bg-gradient-to-br from-forest-700 to-forest-950" />
              <SparkleIcon className="relative h-6 w-6 text-clay-400 transition-transform duration-500 group-hover:rotate-90" />
              <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-forest-950 bg-moss-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Panel ---------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Great Nature Homes chat assistant"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{ transformOrigin: "bottom right" }}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-stone-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(700px,calc(100dvh-3rem))] sm:w-[410px] sm:rounded-[28px] sm:border sm:border-forest-900/10 sm:shadow-[0_32px_80px_-20px_rgba(17,25,15,0.45)]"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-forest-950 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-stone-50">
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-moss-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-10 h-40 w-40 rounded-full bg-clay-500/20 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-clay-400 to-clay-600 p-[1.5px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-forest-900">
                      <SparkleIcon className="h-5 w-5 text-clay-400" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-forest-950 bg-moss-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[19px] leading-tight tracking-tight">Nature Concierge</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-stone-300/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss-400" />
                    AI assistant · Great Nature Homes
                  </p>
                </div>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear((v) => !v)}
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-stone-50"
                  >
                    <TrashIcon />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-stone-50"
                >
                  <ChevronDownIcon />
                </button>
              </div>

              <AnimatePresence>
                {confirmClear && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative overflow-hidden"
                  >
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-xs">
                      <span>Clear this conversation?</span>
                      <span className="flex gap-1.5">
                        <button type="button" onClick={() => setConfirmClear(false)} className="rounded-full px-3 py-1 text-stone-300 hover:bg-white/10">
                          Cancel
                        </button>
                        <button type="button" onClick={clearChat} className="rounded-full bg-clay-500 px-3 py-1 font-semibold hover:bg-clay-600">
                          Clear
                        </button>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
              {messages.length === 0 ? (
                <Welcome pageProjectName={pageProject?.name} pageProjectImage={pageProject?.image} actions={quickActions} onAsk={send} />
              ) : (
                <div className="space-y-5">
                  {messages.map((m) =>
                    m.role === "user" ? (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-end">
                        <div className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-forest-900 px-4 py-2.5 text-[13.5px] leading-relaxed text-stone-50 shadow-sm">
                          {m.text}
                        </div>
                        <span className="mt-1 pr-1 text-[10px] text-stone-400">{timeLabel(m.at)}</span>
                      </motion.div>
                    ) : (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-950">
                          <SparkleIcon className="h-3.5 w-3.5 text-clay-400" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2.5">
                          {m.text ? (
                            <div
                              className={`w-fit max-w-full rounded-[20px] rounded-tl-md border px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                                m.status === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-forest-900/[0.07] bg-white text-stone-700"
                              }`}
                            >
                              <ChatMarkdown text={m.text} onNavigate={onNavigate} />
                              {m.status === "streaming" && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-clay-500" />}
                            </div>
                          ) : (
                            m.status === "streaming" && <TypingIndicator />
                          )}
                          {m.widgets.map((w, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                              <ChatWidgetView widget={w} onAsk={send} onNavigate={onNavigate} />
                            </motion.div>
                          ))}
                          {m.status !== "streaming" && <span className="block pl-1 text-[10px] text-stone-400">{timeLabel(m.at)}</span>}
                        </div>
                      </motion.div>
                    ),
                  )}

                  {!busy && lastAssistant && lastAssistant.suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 pl-9">
                      {lastAssistant.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="rounded-full border border-clay-500/30 bg-clay-400/[0.08] px-3 py-1.5 text-xs font-medium text-clay-600 transition-colors hover:border-clay-500 hover:bg-clay-500 hover:text-stone-50"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-forest-900/[0.07] bg-white/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2 rounded-[22px] border border-forest-900/10 bg-stone-50 p-1.5 pl-4 transition-colors focus-within:border-clay-500/60 focus-within:bg-white"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  maxLength={1000}
                  placeholder={pageProject ? `Ask about ${pageProject.name}…` : "Ask about villas, locations, prices…"}
                  aria-label="Message"
                  className="max-h-[120px] flex-1 resize-none bg-transparent py-2 text-[14px] text-forest-950 outline-none placeholder:text-stone-400"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    aria-label="Stop response"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-stone-50 transition-colors hover:bg-forest-700"
                  >
                    <span className="h-3 w-3 rounded-[3px] bg-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-500 text-stone-50 transition-all hover:bg-clay-600 disabled:bg-stone-200 disabled:text-stone-400"
                  >
                    <SendIcon />
                  </button>
                )}
              </form>
              <p className="mt-2 text-center text-[10px] text-stone-400">
                AI answers from Great Nature Homes data · Pricing confirmed by our consultants
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Welcome({
  pageProjectName,
  pageProjectImage,
  actions,
  onAsk,
}: {
  pageProjectName?: string;
  pageProjectImage?: string;
  actions: { icon: string; title: string; sub: string; q: string }[];
  onAsk: (q: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {pageProjectImage ? (
        <div className="relative mb-5 h-28 overflow-hidden rounded-2xl">
          <Image src={pageProjectImage} alt="" fill sizes="400px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 to-forest-950/20" />
          <div className="absolute inset-y-0 left-4 flex flex-col justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-clay-400">You&apos;re viewing</span>
            <span className="font-display text-xl text-stone-50">{pageProjectName}</span>
          </div>
        </div>
      ) : null}

      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-clay-600">{greeting}</span>
      <h3 className="mt-2 font-display text-[28px] leading-[1.1] tracking-tight text-forest-950">
        How can I help you find your <em className="text-moss-500">home in nature</em>?
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed text-stone-500">
        Ask me anything about our villa communities in Kochi — specs, amenities, locations, comparisons — or book a visit in seconds.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {actions.map((a, i) => (
          <motion.button
            key={a.title}
            type="button"
            onClick={() => onAsk(a.q)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="group flex flex-col items-start rounded-2xl border border-forest-900/[0.08] bg-white p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-clay-500/40 hover:shadow-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-950 text-sm text-clay-400 transition-colors group-hover:bg-clay-500 group-hover:text-stone-50">
              {a.icon}
            </span>
            <span className="mt-3 text-[13px] font-semibold text-forest-950">{a.title}</span>
            <span className="text-[11px] text-stone-500">{a.sub}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["Villas with a private pool", "How long does construction take?", "Who is the founder?"].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-forest-900/10 bg-white px-3 py-1.5 text-xs text-stone-700 transition-colors hover:border-clay-500 hover:text-clay-600"
          >
            {q}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-[20px] rounded-tl-md border border-forest-900/[0.07] bg-white px-4 py-3.5 shadow-sm">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-moss-500"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* Icons */
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11 3.5c.55 4.9 2.6 6.95 7.5 7.5-4.9.55-6.95 2.6-7.5 7.5-.55-4.9-2.6-6.95-7.5-7.5 4.9-.55 6.95-2.6 7.5-7.5z" />
      <path d="M18.5 14.5c.25 2 1 2.75 3 3-2 .25-2.75 1-3 3-.25-2-1-2.75-3-3 2-.25 2.75-1 3-3z" opacity=".7" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
