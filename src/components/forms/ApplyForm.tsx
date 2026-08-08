"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { RadioGroup, Select, Text, TextArea } from "./Fields";
import { contact } from "@/content/config";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

type Status = "idle" | "sending" | "sent" | "error";

export function ApplyForm({ locale, dict }: { locale: Locale; dict: Dict }) {
  const t = dict.apply;
  const f = t.fields;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.fullName || !data.email || !data.why || !data.built) {
      setStatus("error");
      setMessage(t.requiredError);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
      setStatus("error");
      setMessage(t.emailError);
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        className="rounded-2xl border border-line bg-white p-10 text-center"
      >
        <span
          aria-hidden
          className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-linear-to-br from-accent-bright to-accent"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M5.5 11.5 9.5 15.5 16.5 7.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="h2">{t.successTitle}</h2>
        <p className="lede mx-auto mt-4 max-w-md">{t.successBody}</p>
        <Link href={`/${locale}`} className="btn btn-ghost mt-8">
          {t.successCta}
        </Link>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-line bg-white p-6 sm:p-9"
    >
      <h2 className="h3">{t.formTitle}</h2>

      <fieldset className="mt-8" disabled={status === "sending"}>
        <legend className="eyebrow mb-5">{t.sections.about}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Text id="fullName" name="fullName" label={f.fullName} required />
          <Text
            id="email"
            name="email"
            type="email"
            label={f.email}
            required
            dir="ltr"
          />
          <Text
            id="phone"
            name="phone"
            type="tel"
            label={f.phone}
            optional={f.optional}
            dir="ltr"
          />
          <Select
            id="year"
            name="year"
            label={f.year}
            options={f.yearOptions}
            placeholder={f.yearPlaceholder}
          />
        </div>
      </fieldset>

      <fieldset className="mt-10" disabled={status === "sending"}>
        <legend className="eyebrow mb-5">{t.sections.links}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Text
            id="linkedin"
            name="linkedin"
            type="url"
            label={f.linkedin}
            optional={f.optional}
            placeholder="https://linkedin.com/in/…"
            dir="ltr"
          />
          <Text
            id="github"
            name="github"
            type="url"
            label={f.github}
            optional={f.optional}
            placeholder="https://github.com/…"
            dir="ltr"
          />
          <div className="sm:col-span-2">
            <Text
              id="portfolio"
              name="portfolio"
              type="url"
              label={f.portfolio}
              optional={f.optional}
              dir="ltr"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-10" disabled={status === "sending"}>
        <legend className="eyebrow mb-5">{t.sections.questions}</legend>
        <div className="grid gap-5">
          <TextArea id="why" name="why" label={f.why} required rows={4} />
          <TextArea id="built" name="built" label={f.built} required rows={4} />
          <Select
            id="interest"
            name="interest"
            label={f.interest}
            options={f.interestOptions}
            placeholder={f.yearPlaceholder}
          />
          <RadioGroup
            name="aiExperience"
            label={f.aiExperience}
            options={f.aiExperienceOptions}
          />
          <Text
            id="projectLink"
            name="projectLink"
            type="url"
            label={f.projectLink}
            dir="ltr"
          />
        </div>
      </fieldset>

      {status === "error" && (
        <p
          role="alert"
          className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message || (
            <>
              {t.errorTitle} {t.errorBody}{" "}
              <a
                href={`mailto:${contact.email}`}
                dir="ltr"
                className="underline"
              >
                {contact.email}
              </a>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary mt-8 w-full disabled:opacity-60"
      >
        {status === "sending" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
