"use client";

import { motion } from "framer-motion";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { TRUST_STATS } from "@/lib/data/stats";

interface EnquiryCTASectionProps {
  heading?: string;
  subheading?: string;
  showStats?: boolean;
  defaultLocation?: string;
  defaultMessage?: string;
}

export function EnquiryCTASection({
  heading = "Build Your Dream Villa With Great Nature Homes",
  subheading = "Share a few details and one of our villa consultants will design a plan around your land, your budget, and the life you want to live in it.",
  showStats = true,
  defaultLocation,
  defaultMessage,
}: EnquiryCTASectionProps = {}) {
  return (
    <section id="enquiry" className="relative overflow-hidden bg-forest-950 px-6 py-24 sm:px-10 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--color-forest-800)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-400">Start Your Journey</span>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl md:text-6xl">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-stone-200/80">{subheading}</p>
        </motion.div>

        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-8 text-center sm:grid-cols-4"
          >
            {TRUST_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-clay-400 sm:text-4xl">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-stone-300/80">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-14 max-w-3xl rounded-3xl border border-stone-50/10 bg-stone-50/[0.03] p-6 sm:p-10"
        >
          <EnquiryForm defaultLocation={defaultLocation} defaultMessage={defaultMessage} />
        </motion.div>
      </div>
    </section>
  );
}
