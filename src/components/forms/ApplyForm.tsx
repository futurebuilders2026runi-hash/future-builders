"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Select, Text, TextArea } from "./Fields";
import { applicationLimits, degreeValues, yearValues, validateApplication, type ApplicationError } from "@/lib/application-schema";
import { contact } from "@/content/config";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

type Status = "idle" | "sending" | "sent" | "error";

export function ApplyForm({ locale, dict }: { locale: Locale; dict: Dict }) {
  const t = dict.apply;
  const f = t.fields;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  function errorMessage(error: string) {
    const messages: Record<ApplicationError, string> = {
      missing_fields: t.requiredError,
      invalid_email: t.emailError,
      invalid_phone: t.phoneError,
      invalid_degree: t.degreeError,
      invalid_year: t.yearError,
      field_too_long: t.lengthError,
    };
    return messages[error as ApplicationError] ?? "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const validation = validateApplication({ ...data, locale });
    if (validation.error) {
      setStatus("error");
      setMessage(errorMessage(validation.error));
      form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(":invalid")?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      if (!res.ok) {
        const result = await res.json();
        setStatus("error");
        setMessage(errorMessage(String(result.error)));
        return;
      }
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
      aria-busy={status === "sending"}
      className="rounded-2xl border border-line bg-white p-6 sm:p-9"
    >
      <h2 className="h3">{t.formTitle}</h2>
      <p className="mt-3 text-sm text-(--muted-fg)">{t.requiredNote}</p>

      <fieldset className="mt-8" disabled={status === "sending"}>
        <legend className="eyebrow mb-5">{t.sections.about}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Text id="firstName" name="firstName" label={f.firstName} required autoComplete="given-name" maxLength={applicationLimits.firstName} />
          <Text id="lastName" name="lastName" label={f.lastName} required autoComplete="family-name" maxLength={applicationLimits.lastName} />
          <Select
            id="degree"
            name="degree"
            label={f.degree}
            options={degreeValues.map((value, i) => ({ value, label: f.degreeOptions[i] }))}
            placeholder={f.degreePlaceholder}
            required
          />
          <Select
            id="year"
            name="year"
            label={f.year}
            options={yearValues.map((value, i) => ({ value, label: f.yearOptions[i] }))}
            placeholder={f.yearPlaceholder}
            required
          />
          <Text id="phone" name="phone" type="tel" label={f.phone} required dir="ltr" maxLength={applicationLimits.phone} />
          <Text id="email" name="email" type="email" label={f.email} required dir="ltr" maxLength={applicationLimits.email} />
        </div>
      </fieldset>

      <fieldset className="mt-10" disabled={status === "sending"}>
        <legend className="eyebrow mb-5">{t.sections.questions}</legend>
        <div className="grid gap-5">
          <TextArea id="why" name="why" label={f.why} required rows={4} maxLength={applicationLimits.why} />
          <TextArea id="background" name="background" label={f.background} placeholder={f.backgroundPlaceholder} required rows={4} maxLength={applicationLimits.background} />
          <TextArea id="aiExperience" name="aiExperience" label={f.aiExperience} optional={f.optional} placeholder={f.aiExperiencePlaceholder} hint={f.aiExperienceHint} rows={4} maxLength={applicationLimits.aiExperience} />
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
