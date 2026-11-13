"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Renders the small markdown subset the assistant uses — paragraphs,
 * bullet/numbered lists, blockquotes, **bold**, *italic* and [links](/x) —
 * as React elements, so model output is never injected as raw HTML.
 */
export function ChatMarkdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (!lines.length) return null;

        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={bi} className="my-1.5 space-y-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-clay-500" />
                  <span>{inline(l.replace(/^\s*[-*•]\s+/, ""), onNavigate)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi} className="my-1.5 space-y-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-clay-600">{li + 1}.</span>
                  <span>{inline(l.replace(/^\s*\d+[.)]\s+/, ""), onNavigate)}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (lines.every((l) => l.startsWith(">"))) {
          return (
            <blockquote key={bi} className="my-1.5 border-l-2 border-clay-400 pl-3 font-display italic text-stone-700">
              {inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), onNavigate)}
            </blockquote>
          );
        }
        return (
          <p key={bi} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""), onNavigate)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

function inline(text: string, onNavigate?: () => void): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-forest-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const cls = "font-medium text-clay-600 underline decoration-clay-400/50 underline-offset-2 hover:decoration-clay-600";
      if (href.startsWith("/") && !href.startsWith("//")) {
        return (
          <Link key={i} href={href} onClick={onNavigate} className={cls}>
            {label}
          </Link>
        );
      }
      if (/^https:\/\//.test(href)) {
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer nofollow" className={cls}>
            {label}
          </a>
        );
      }
      return label;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
