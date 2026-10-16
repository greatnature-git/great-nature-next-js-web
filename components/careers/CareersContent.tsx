"use client";

import { motion } from "framer-motion";
import { CAREERS } from "@/lib/data/careers";
import { COMPANY_CONTACT } from "@/lib/data/about";

const VALUES = [
  {
    title: "Like Family",
    description: "We treat our team the way we treat our clients — with care, respect, and the long view in mind.",
  },
  {
    title: "Built On Collaboration",
    description: "A happy, healthy, genuinely collaborative place to do your best work is the standard we hold ourselves to.",
  },
  {
    title: "Passionate & Skilled",
    description: "We look for people who care about craft — architects, engineers, builders, and everyone who keeps a project moving.",
  },
];

/**
 * No specific job listings — none can be verified as currently open for
 * this company, so a fabricated "open role" would just waste an
 * applicant's time. Interested candidates are routed to a real inbox.
 */
export function CareersContent() {
  return (
    <>
      <section className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">{CAREERS.eyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
              {CAREERS.heading}
            </h2>
            <p className="mt-5 text-stone-700">{CAREERS.paragraph}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-forest-900/10 bg-white p-7">
              <span className="block h-1.5 w-8 rounded-full bg-clay-500" />
              <h3 className="mt-5 font-display text-lg font-medium text-forest-950">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{value.description}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="border-y border-forest-900/10 bg-stone-100 px-6 py-16 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-5xl flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-medium tracking-tight text-forest-950 sm:text-3xl">
              No Open Role Right Now?
            </h2>
            <p className="mt-3 text-stone-700">{CAREERS.note}</p>
          </div>
          <a
            href={`mailto:${COMPANY_CONTACT.email}?subject=${encodeURIComponent("Career Enquiry")}`}
            className="inline-block shrink-0 whitespace-nowrap rounded-full bg-clay-500 px-7 py-3.5 text-sm font-semibold text-stone-50 transition-colors hover:bg-clay-600"
          >
            Email Your Resume
          </a>
        </motion.div>
      </section>
    </>
  );
}
