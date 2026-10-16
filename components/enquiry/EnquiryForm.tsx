"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { enquirySchema, type EnquiryInput } from "@/lib/enquiry-schema";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface EnquiryFormProps {
  defaultLocation?: string;
  defaultMessage?: string;
}

export function EnquiryForm({ defaultLocation = "", defaultMessage = "" }: EnquiryFormProps = {}) {
  const [state, setState] = useState<SubmitState>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
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

  const onSubmit = async (data: EnquiryInput) => {
    setState("submitting");
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Full Name" error={errors.name?.message}>
        <input
          {...register("name")}
          type="text"
          placeholder="Aditya Sharma"
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field label="Phone Number" error={errors.phone?.message}>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+91 98765 43210"
          className={inputClass}
          autoComplete="tel"
        />
      </Field>

      <Field label="Email Address" error={errors.email?.message} className="sm:col-span-2">
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <Field label="Preferred Location" error={errors.location?.message}>
        <input {...register("location")} type="text" placeholder="Lonavala, Alibaug…" className={inputClass} />
      </Field>

      <Field label="Budget" error={errors.budget?.message}>
        <input
          {...register("budget")}
          type="text"
          placeholder="e.g. ₹2 Cr – ₹3 Cr"
          className={inputClass}
        />
      </Field>

      <Field label="Message" error={errors.message?.message} className="sm:col-span-2">
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Tell us about the villa you're envisioning…"
          className={inputClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state === "submitting" || !isValid}
          className="w-full rounded-full bg-clay-500 px-8 py-4 text-sm font-semibold tracking-wide text-stone-50 transition-colors hover:bg-clay-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "submitting" ? "Submitting…" : "Submit Enquiry"}
        </button>
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
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-300/80">{label}</span>
      {children}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </label>
  );
}
