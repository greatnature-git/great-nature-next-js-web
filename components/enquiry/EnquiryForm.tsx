"use client";

import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { enquirySchema, type EnquiryInput } from "@/lib/enquiry-schema";

type SubmitState = "idle" | "submitting" | "success" | "error";

const shakeAnimation = {
  x: [0, -9, 8, -6, 5, -3, 2, 0],
  transition: { duration: 0.5, ease: "easeInOut" as const },
};

interface EnquiryFormProps {
  defaultLocation?: string;
  defaultMessage?: string;
}

export function EnquiryForm({ defaultLocation = "", defaultMessage = "" }: EnquiryFormProps = {}) {
  const [state, setState] = useState<SubmitState>("idle");
  const [shakeCount, setShakeCount] = useState(0);
  const [showRequiredHint, setShowRequiredHint] = useState(false);
  const buttonControls = useAnimation();
  const pathname = usePathname();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      location: defaultLocation,
      budget: "",
      message: defaultMessage,
    },
  });

  // The App Router keeps a visited page's component tree alive (hidden,
  // not unmounted) for fast back/forward navigation, so this form would
  // otherwise still hold whatever was typed the next time its page becomes
  // active again. Clear it the moment the user navigates to any other
  // screen, so it's blank again whenever this one comes back.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reset();
    setState("idle");
    setShowRequiredHint(false);
  }, [pathname, reset]);

  const onSubmit = async (data: EnquiryInput) => {
    setState("submitting");
    setShowRequiredHint(false);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      reset();
    } catch {
      setState("error");
    }
  };

  // Runs when the user hits Submit while required fields are still empty
  // or invalid. The button is never disabled for this reason, so a click
  // always gets this tangible, animated feedback instead of silently doing
  // nothing.
  const onInvalid = () => {
    setShowRequiredHint(true);
    setShakeCount((count) => count + 1);
    buttonControls.start(shakeAnimation);
  };

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-moss-500/30 bg-forest-900/40 p-8 text-center"
      >
        <h3 className="font-display text-2xl text-stone-50">Thank you — we&apos;ve got it.</h3>
        <p className="mt-2 text-stone-200/80">
          Our villa consultants will reach out within one business day to continue the conversation.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 text-sm font-medium text-clay-400 underline-offset-4 hover:underline"
        >
          Submit another enquiry
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Full Name" error={errors.name?.message} required shakeCount={shakeCount}>
        <input
          {...register("name")}
          type="text"
          placeholder="Enter your full name"
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field label="Phone Number" error={errors.phone?.message} required shakeCount={shakeCount}>
        <input
          {...register("phone")}
          type="tel"
          placeholder="Enter your phone number"
          className={inputClass}
          autoComplete="tel"
        />
      </Field>

      <Field
        label="Email Address"
        error={errors.email?.message}
        required
        shakeCount={shakeCount}
        className="sm:col-span-2"
      >
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email address"
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <Field label="Preferred Location" error={errors.location?.message} shakeCount={shakeCount}>
        <input
          {...register("location")}
          type="text"
          placeholder="Enter your preferred location"
          className={inputClass}
        />
      </Field>

      <Field label="Budget" error={errors.budget?.message} shakeCount={shakeCount}>
        <input
          {...register("budget")}
          type="text"
          placeholder="Enter your budget"
          className={inputClass}
        />
      </Field>

      <Field label="Message" error={errors.message?.message} shakeCount={shakeCount} className="sm:col-span-2">
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Enter your message"
          className={inputClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <motion.button
          type="submit"
          animate={buttonControls}
          disabled={state === "submitting"}
          whileHover={state === "submitting" ? undefined : { scale: 1.015 }}
          whileTap={state === "submitting" ? undefined : { scale: 0.98 }}
          className="w-full rounded-full bg-clay-500 px-8 py-4 text-sm font-semibold tracking-wide text-stone-50 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition-colors hover:bg-clay-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "submitting" ? "Submitting…" : "Submit Enquiry"}
        </motion.button>
        <AnimatePresence>
          {showRequiredHint && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 text-sm text-red-300"
            >
              Please fill in the fields marked with <span className="text-clay-400">*</span> — they&apos;re
              required before we can send your enquiry.
            </motion.p>
          )}
        </AnimatePresence>
        {state === "error" && (
          <p className="mt-3 text-sm text-red-300">Something went wrong. Please try again in a moment.</p>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-100/15 bg-stone-50/5 px-4 py-3 text-stone-50 placeholder:text-stone-300/50 outline-none ring-0 transition-colors focus:border-clay-400 focus:bg-stone-50/10";

function Field({
  label,
  error,
  required,
  shakeCount = 0,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  shakeCount?: number;
  className?: string;
  children: ReactElement<{ className?: string }>;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (shakeCount === 0 || !error) return;
    controls.start(shakeAnimation);
    // Re-run only when a fresh submit attempt happens — not on every
    // keystroke revalidation — so the shake plays once per failed click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeCount]);

  const styledInput = cloneElement(children, {
    className: `${children.props.className ?? ""} ${
      error ? "border-red-400/60 bg-red-500/[0.06] focus:border-red-400" : ""
    }`,
  });

  return (
    <motion.label animate={controls} className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-300/80">
        {label}
        {required && (
          <span className="ml-1 text-clay-400" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {styledInput}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-red-300"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.label>
  );
}
