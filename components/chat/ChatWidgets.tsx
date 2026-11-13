"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { PREVIOUS_PROJECTS, type Project } from "@/lib/data/projects";
import { COMPANY_CONTACT } from "@/lib/data/about";
import { enquirySchema } from "@/lib/enquiry-schema";
import { findProject, googleMapsSearchUrl } from "@/lib/chat/knowledge";
import type { ChatWidget } from "@/lib/chat/types";

interface WidgetProps {
  onAsk: (text: string) => void;
  onNavigate: () => void;
}

export function ChatWidgetView({ widget, ...props }: { widget: ChatWidget } & WidgetProps) {
  switch (widget.kind) {
    case "projects":
      return <ProjectsWidget slugs={widget.slugs} {...props} />;
    case "location":
      return <LocationWidget slug={widget.slug} {...props} />;
    case "compare":
      return <CompareWidget slugs={widget.slugs} {...props} />;
    case "enquiry":
      return <EnquiryWidget projectSlug={widget.projectSlug} note={widget.note} />;
    case "contact":
      return <ContactWidget />;
  }
}

const cardShell = "overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-[0_6px_24px_-12px_rgba(17,25,15,0.25)]";

/* ------------------------------------------------------------------ */
/* Project cards — horizontal snap carousel                            */
/* ------------------------------------------------------------------ */

function ProjectsWidget({ slugs, onAsk, onNavigate }: { slugs: string[] } & WidgetProps) {
  const projects = slugs.map(findProject).filter((p): p is Project => Boolean(p));
  if (!projects.length) return null;
  const single = projects.length === 1;

  return (
    <div
      data-lenis-prevent
      className={`-mx-1 flex gap-3 px-1 pb-1 ${single ? "" : "snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}`}
    >
      {projects.map((p) => (
        <div key={p.slug} className={`${cardShell} ${single ? "w-full" : "w-[78%] shrink-0 snap-start"}`}>
          <div className="relative h-32 w-full bg-forest-900/10">
            <Image src={p.image} alt={p.name} fill sizes="320px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent" />
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${
                p.status === "Ongoing" ? "bg-clay-500/90 text-stone-50" : "bg-forest-950/80 text-stone-100"
              }`}
            >
              {p.status}
            </span>
            <div className="absolute inset-x-3 bottom-2.5">
              <p className="font-display text-lg leading-tight text-stone-50">{p.name}</p>
              <p className="text-[11px] text-stone-200/90">{p.location}</p>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                ["Config", p.specs.bhk],
                ["Area", p.specs.area.replace(" sq.ft.", " sqft")],
                ["Plot", p.specs.landParcel],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-stone-100/70 px-1 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">{label}</p>
                  <p className="text-[11px] font-semibold text-forest-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex gap-2">
              <Link
                href={`/projects/${p.slug}`}
                onClick={onNavigate}
                className="flex-1 rounded-full bg-forest-900 py-2 text-center text-[11px] font-semibold text-stone-50 transition-colors hover:bg-forest-700"
              >
                View details
              </Link>
              <button
                type="button"
                onClick={() => onAsk(`Where is ${p.name} located?`)}
                className="flex-1 rounded-full border border-forest-900/15 py-2 text-[11px] font-semibold text-forest-900 transition-colors hover:border-clay-500 hover:text-clay-600"
              >
                📍 Location
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Location — live map + nearby                                        */
/* ------------------------------------------------------------------ */

function LocationWidget({ slug, onAsk, onNavigate }: { slug: string } & WidgetProps) {
  const p = findProject(slug);
  const [loaded, setLoaded] = useState(false);
  if (!p) return null;

  return (
    <div className={cardShell}>
      <div className="relative h-44 w-full bg-stone-100">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-100 to-stone-200" />}
        <iframe
          src={p.mapEmbedSrc}
          title={`${p.name} on Google Maps`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-500/10 text-clay-600">
            <PinIcon />
          </span>
          <div>
            <p className="font-display text-base leading-tight text-forest-950">{p.name}</p>
            <p className="text-xs text-stone-500">{p.location}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.nearby.map((n) => (
            <span key={n.name} className="rounded-full bg-stone-100 px-2.5 py-1 text-[10.5px] text-stone-700">
              {n.name} <span className="font-semibold text-forest-800">· {n.distance}</span>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <a
            href={googleMapsSearchUrl(p)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-forest-900 py-2 text-center text-[11px] font-semibold text-stone-50 transition-colors hover:bg-forest-700"
          >
            Get directions ↗
          </a>
          <button
            type="button"
            onClick={() => onAsk(`I'd like to book a site visit to ${p.name}`)}
            className="flex-1 rounded-full bg-clay-500 py-2 text-[11px] font-semibold text-stone-50 transition-colors hover:bg-clay-600"
          >
            Book site visit
          </button>
        </div>
        <Link
          href={`/projects/${p.slug}`}
          onClick={onNavigate}
          className="mt-2 block text-center text-[11px] font-medium text-stone-500 underline-offset-4 hover:text-clay-600 hover:underline"
        >
          Open project page
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison table                                                    */
/* ------------------------------------------------------------------ */

function CompareWidget({ slugs, onAsk }: { slugs: string[] } & WidgetProps) {
  const projects = slugs.map(findProject).filter((p): p is Project => Boolean(p));
  if (projects.length < 2) return null;

  const rows: [string, (p: Project) => string][] = [
    ["Location", (p) => p.location.split(",")[0]],
    ["Status", (p) => p.status],
    ["Config", (p) => p.specs.bhk],
    ["Built-up", (p) => p.specs.area],
    ["Plot", (p) => p.specs.landParcel],
    ["Villas", (p) => (p.villaCount ? String(p.villaCount) : "—")],
    ["Highlights", (p) => p.amenities.slice(0, 3).join(", ")],
  ];

  return (
    <div className={cardShell}>
      <div data-lenis-prevent className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-forest-950 text-stone-50">
              <th className="sticky left-0 z-10 bg-forest-950 px-3 py-2.5 font-medium text-stone-300/80" />
              {projects.map((p) => (
                <th key={p.slug} className="max-w-[140px] px-3 py-2.5 font-display text-[13px] font-medium">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get], i) => (
              <tr key={label} className={i % 2 ? "bg-stone-50" : "bg-white"}>
                <td className={`sticky left-0 z-10 px-3 py-2 font-semibold uppercase tracking-wider text-[9.5px] text-stone-500 ${i % 2 ? "bg-stone-50" : "bg-white"}`}>
                  {label}
                </td>
                {projects.map((p) => (
                  <td key={p.slug} className="max-w-[140px] whitespace-normal px-3 py-2 align-top text-forest-900">
                    {get(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 border-t border-forest-900/10 p-2.5">
        <button
          type="button"
          onClick={() => onAsk("Which of these would you recommend for a family?")}
          className="flex-1 rounded-full border border-forest-900/15 py-2 text-[11px] font-semibold text-forest-900 transition-colors hover:border-clay-500 hover:text-clay-600"
        >
          Help me choose
        </button>
        <button
          type="button"
          onClick={() => onAsk("I'd like to book a site visit")}
          className="flex-1 rounded-full bg-clay-500 py-2 text-[11px] font-semibold text-stone-50 transition-colors hover:bg-clay-600"
        >
          Book site visit
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline enquiry form                                                 */
/* ------------------------------------------------------------------ */

const BUDGETS = ["Under ₹2.5 Cr", "₹2.5 – 5 Cr", "Above ₹5 Cr"];
const VISIT_OPTIONS = ["Site visit", "Phone call", "Video tour"];

function EnquiryWidget({ projectSlug, note }: { projectSlug?: string; note?: string }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", project: projectSlug ?? "", budget: "", visit: "Site visit", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const project = PREVIOUS_PROJECTS.find((p) => p.slug === form.project);
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      location: project ? `${project.name} — ${project.location}` : "",
      budget: form.budget,
      message: [`[Chat concierge] Preferred: ${form.visit}.`, note, form.message].filter(Boolean).join(" "),
    };
    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])));
      return;
    }
    setState("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className={`${cardShell} p-5 text-center`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss-500 text-stone-50"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <p className="mt-3 font-display text-lg text-forest-950">Thank you, {form.name.split(" ")[0]}!</p>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          Your request is with our villa consultants. Expect a call on <span className="font-semibold text-forest-900">{form.phone}</span> within one
          business day.
        </p>
      </motion.div>
    );
  }

  const input = (key: "name" | "phone" | "email", placeholder: string, type: string, autoComplete: string) => (
    <div>
      <input
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[key])}
        className={`w-full rounded-xl border bg-stone-50 px-3 py-2.5 text-[13px] text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:border-clay-500 focus:bg-white ${
          errors[key] ? "border-red-400/70" : "border-forest-900/10"
        }`}
      />
      {errors[key] && <p className="mt-1 text-[10.5px] text-red-600">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className={`${cardShell} p-3.5`} noValidate>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay-500/10 text-clay-600">
          <CalendarIcon />
        </span>
        <div>
          <p className="font-display text-[15px] leading-tight text-forest-950">Request a consultation</p>
          <p className="text-[10.5px] text-stone-500">Reply within one business day · No spam</p>
        </div>
      </div>

      <div className="space-y-2">
        {input("name", "Full name *", "text", "name")}
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          {input("phone", "Phone *", "tel", "tel")}
          {input("email", "Email *", "email", "email")}
        </div>
        <select
          value={form.project}
          onChange={(e) => set("project", e.target.value)}
          className="w-full rounded-xl border border-forest-900/10 bg-stone-50 px-3 py-2.5 text-[13px] text-forest-950 outline-none focus:border-clay-500"
        >
          <option value="">Any project — help me choose</option>
          {PREVIOUS_PROJECTS.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>

        <ChipGroup label="Budget" options={BUDGETS} value={form.budget} onChange={(v) => set("budget", form.budget === v ? "" : v)} />
        <ChipGroup label="I'd prefer" options={VISIT_OPTIONS} value={form.visit} onChange={(v) => set("visit", v)} />

        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={2}
          maxLength={600}
          placeholder="Anything else? (optional)"
          className="w-full resize-none rounded-xl border border-forest-900/10 bg-stone-50 px-3 py-2.5 text-[13px] text-forest-950 outline-none placeholder:text-stone-400 focus:border-clay-500 focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="mt-3 w-full rounded-full bg-clay-500 py-2.5 text-[13px] font-semibold text-stone-50 shadow-[0_8px_20px_-10px_rgba(166,109,59,0.9)] transition-colors hover:bg-clay-600 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send request"}
      </button>
      {state === "error" && <p className="mt-2 text-center text-[11px] text-red-600">Couldn&apos;t send right now — please try again.</p>}
    </form>
  );
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              value === o ? "border-forest-900 bg-forest-900 text-stone-50" : "border-forest-900/15 text-stone-700 hover:border-clay-500"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

function ContactWidget() {
  const digits = COMPANY_CONTACT.phone.replace(/\D/g, "");
  const items = [
    { label: "Call us", sub: COMPANY_CONTACT.phone, href: `tel:${COMPANY_CONTACT.phone.replace(/\s/g, "")}`, icon: <PhoneIcon /> },
    {
      label: "WhatsApp",
      sub: "Chat instantly",
      href: `https://wa.me/${digits}?text=${encodeURIComponent("Hi, I'd like to know more about Great Nature Homes villas.")}`,
      icon: <ChatIcon />,
    },
    { label: "Email", sub: COMPANY_CONTACT.email, href: `mailto:${COMPANY_CONTACT.email}`, icon: <MailIcon /> },
  ];
  return (
    <div className={`${cardShell} divide-y divide-forest-900/5`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-stone-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-stone-50 transition-colors group-hover:bg-clay-500">
            {item.icon}
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-semibold text-forest-950">{item.label}</span>
            <span className="block text-[11px] text-stone-500">{item.sub}</span>
          </span>
          <span className="text-stone-400 transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      ))}
      <p className="px-3.5 py-2 text-[10.5px] text-stone-500">📍 Office: {COMPANY_CONTACT.address}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function PinIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </svg>
  );
}
