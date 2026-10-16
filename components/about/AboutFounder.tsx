"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { COMPANY_CONTACT, FOUNDER } from "@/lib/data/about";

/** The founder/MD section — photo, credentials, and a message from the MD, plus real company contact details. */
export function AboutFounder() {
  return (
    <section className="bg-stone-50 px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Leadership</span>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
            Founder of Great Nature Homes
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl bg-forest-950 p-8 text-center"
          >
            <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-2xl ring-1 ring-stone-50/15 sm:h-64 sm:w-64">
              <Image src={FOUNDER.photo} alt={FOUNDER.name} fill sizes="256px" className="object-cover" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-medium text-stone-50">{FOUNDER.name}</h3>
            <p className="mt-1 text-sm text-stone-300/80">{FOUNDER.title}</p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {FOUNDER.credentials.map((credential) => (
                <span
                  key={credential}
                  className="rounded-full border border-stone-50/20 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-stone-100"
                >
                  {credential}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-600">Message from the MD</span>
            <div className="mt-4 space-y-4 text-stone-700">
              {FOUNDER.message.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-5 font-display text-lg text-forest-950">— {FOUNDER.name}</p>

            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-forest-900/10 pt-8 sm:grid-cols-3">
              <ContactItem label="Phone" value={COMPANY_CONTACT.phone} href={`tel:${COMPANY_CONTACT.phone}`} />
              <ContactItem label="Email" value={COMPANY_CONTACT.email} href={`mailto:${COMPANY_CONTACT.email}`} />
              <ContactItem label="Office" value={COMPANY_CONTACT.address} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-forest-950">{value}</p>
    </>
  );

  if (href) {
    return (
      <a href={href} className="transition-colors hover:text-clay-600">
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}
