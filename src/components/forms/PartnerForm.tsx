"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Text, TextArea } from "./Fields";
import { contact } from "@/content/config";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

type Status = "idle" | "sending" | "sent" | "error";

export function PartnerForm({ locale, dict }: { locale: Locale; dict: Dict }) {
  const t = dict.companies;
  const f = t.fields;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name || !data.company || !data.email || !data.idea) {
      setStatus("error");
      setMessage(dict.apply.requiredError);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
      setStatus("error");
      setMessage(dict.apply.emailError);
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("");
    }
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-line bg-white p-6 text-center"
      >
        <h2 className="h2">{t.successTitle}</h2>
        <p className="lede mx-auto mt-3 max-w-md">{t.successBody}</p>
        <Link href={`/${locale}`} className="btn btn-ghost mt-5">
          {t.successCta}
        </Link>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-line bg-white p-4 sm:p-6"
    >
      <h2 className="h3">{t.formTitle}</h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
        {t.formBody}
      </p>

      <fieldset className="mt-5 grid gap-3" disabled={status === "sending"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Text id="p-name" name="name" label={f.name} required />
          <Text id="p-company" name="company" label={f.company} required />
          <Text id="p-role" name="role" label={f.role} />
          <Text
            id="p-email"
            name="email"
            type="email"
            label={f.email}
            required
            dir="ltr"
          />
        </div>
        <TextArea
          id="p-idea"
          name="idea"
          label={f.idea}
          placeholder={f.ideaPlaceholder}
          required
          rows={5}
        />
      </fieldset>

      {status === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message || (
            <>
              {dict.apply.errorTitle} {dict.apply.errorBody}{" "}
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
                {dict.apply.errorContact}
              </a>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary mt-5 w-full disabled:opacity-60"
      >
        {status === "sending" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
