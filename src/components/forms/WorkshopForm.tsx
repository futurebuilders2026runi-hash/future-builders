"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Select, Text, TextArea } from "./Fields";
import {
  POOL_IDEA_CAPACITY,
  validateWorkshop,
  workshopDegreeValues,
  workshopLimits,
  workshopYearValues,
  type Participation,
  type PoolIdeaUsage,
  type WorkshopError,
} from "@/lib/workshop-schema";
import { contact } from "@/content/config";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

type Status = "idle" | "sending" | "sent" | "error";

export function WorkshopForm({ locale, dict }: { locale: Locale; dict: Dict }) {
  const t = dict.workshop;
  const f = t.fields;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [participation, setParticipation] = useState<Participation>("solo");
  const [ideaMode, setIdeaMode] = useState<"own" | "pool">("own");
  const [poolPick, setPoolPick] = useState("");
  const [usage, setUsage] = useState<PoolIdeaUsage | null>(null);

  async function loadUsage() {
    try {
      const res = await fetch("/api/workshop/ideas", { cache: "no-store" });
      if (res.ok) setUsage(await res.json());
    } catch {
      // Without availability data every idea stays selectable; the server still enforces the limit.
      setUsage({});
    }
  }

  useEffect(() => {
    if (ideaMode === "pool" && usage === null) loadUsage();
  }, [ideaMode, usage]);

  const taken = (id: string) => usage?.[id as keyof PoolIdeaUsage];
  const pickedTaken = poolPick ? taken(poolPick) : undefined;
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "sent") return;
    const confirmation = successRef.current;
    if (!confirmation) return;
    confirmation.focus({ preventScroll: true });
    confirmation.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [status]);

  function errorMessage(error: string) {
    const messages: Record<WorkshopError, string> = {
      missing_fields: t.requiredError,
      missing_team: t.teamError,
      invalid_email: t.emailError,
      invalid_phone: t.phoneError,
      invalid_degree: t.degreeError,
      invalid_year: t.yearError,
      idea_full: f.ideaFullError,
      field_too_long: t.lengthError,
    };
    return messages[error as WorkshopError] ?? "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const { poolIdea, ...data } = Object.fromEntries(new FormData(form).entries());
    data.poolIdea = "";

    // A pool pick is saved by id (for the 3-per-idea limit) and as labelled idea text for the admin.
    if (ideaMode === "pool") {
      const idea = f.ideaPool.find((item) => item.id === poolIdea);
      if (!idea) {
        setStatus("error");
        setMessage(f.ideaPoolError);
        form.querySelector<HTMLInputElement>('input[name="poolIdea"]')?.focus();
        return;
      }
      data.idea = `${f.ideaPoolPrefix}: ${idea.title}`;
      data.poolIdea = idea.id;
    }

    const validation = validateWorkshop({ ...data, locale });
    if (validation.error) {
      setStatus("error");
      setMessage(errorMessage(validation.error));
      const target =
        validation.error === "missing_team"
          ? form.querySelector<HTMLTextAreaElement>("#teamMembers")
          : form.querySelector<HTMLInputElement | HTMLTextAreaElement>(":invalid");
      target?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(errorMessage(String(result.error)));
        if (result.error === "idea_full") {
          setPoolPick("");
          loadUsage();
        }
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage("");
    }
  }

  if (status === "sent") {
    return (
      <motion.div
        ref={successRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-line bg-white p-6 text-center"
      >
        <span
          aria-hidden
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-linear-to-br from-accent-bright to-accent"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5.5 11.5 9.5 15.5 16.5 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
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
      aria-busy={status === "sending"}
      className="rounded-2xl border border-line bg-white p-4 sm:p-6"
    >
      <h2 className="h3">{t.formTitle}</h2>
      <p className="mt-3 text-sm text-(--muted-fg)">{t.requiredNote}</p>

      <fieldset className="mt-5" disabled={status === "sending"}>
        <legend className="eyebrow mx-auto mb-3 md:mx-0">{t.sections.about}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Text id="fullName" name="fullName" label={f.fullName} required autoComplete="name" maxLength={workshopLimits.fullName} />
          </div>
          <Text id="phone" name="phone" type="tel" label={f.phone} required dir="ltr" maxLength={workshopLimits.phone} />
          <Text id="email" name="email" type="email" label={f.email} required dir="ltr" maxLength={workshopLimits.email} />
          <Select
            id="degree"
            name="degree"
            label={f.degree}
            options={workshopDegreeValues.map((value, i) => ({ value, label: f.degreeOptions[i] }))}
            placeholder={f.degreePlaceholder}
            required
          />
          <Select
            id="year"
            name="year"
            label={f.year}
            options={workshopYearValues.map((value, i) => ({ value, label: f.yearOptions[i] }))}
            placeholder={f.yearPlaceholder}
            required
          />
        </div>
      </fieldset>

      <fieldset className="mt-6" disabled={status === "sending"}>
        <legend className="eyebrow mx-auto mb-3 md:mx-0">{t.sections.team}</legend>
        <p className="field-label">{f.participation}</p>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={f.participation}>
          {(["solo", "team"] as const).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-brand transition-colors has-checked:border-accent has-checked:bg-accent/8"
            >
              <input
                type="radio"
                name="participation"
                value={value}
                checked={participation === value}
                onChange={() => setParticipation(value)}
                className="h-4 w-4 accent-(--color-accent)"
              />
              {value === "solo" ? f.solo : f.team}
            </label>
          ))}
        </div>
        {participation === "team" && (
          <div className="mt-3">
            <TextArea
              id="teamMembers"
              name="teamMembers"
              label={f.teamMembers}
              placeholder={f.teamMembersPlaceholder}
              hint={f.teamMembersHint}
              required
              rows={3}
              maxLength={workshopLimits.teamMembers}
            />
          </div>
        )}
      </fieldset>

      <fieldset className="mt-6" disabled={status === "sending"}>
        <legend className="eyebrow mx-auto mb-3 md:mx-0">{t.sections.questions}</legend>
        <div className="grid gap-3">
          <div>
            <p className="field-label">{f.idea}</p>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={f.idea}>
              {(["own", "pool"] as const).map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-brand transition-colors has-checked:border-accent has-checked:bg-accent/8"
                >
                  <input
                    type="radio"
                    name="ideaMode"
                    value={value}
                    checked={ideaMode === value}
                    onChange={() => setIdeaMode(value)}
                    className="h-4 w-4 accent-(--color-accent)"
                  />
                  {f.ideaMode[value]}
                </label>
              ))}
            </div>

            {ideaMode === "own" ? (
              <div className="mt-3">
                <TextArea id="idea" name="idea" label={f.ideaOwnLabel} placeholder={f.ideaPlaceholder} required rows={4} maxLength={workshopLimits.idea} />
              </div>
            ) : (
              <fieldset className="mt-3">
                <legend className="field-label">{f.ideaPoolLabel}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {f.ideaPool.map((idea) => {
                    const count = taken(idea.id)?.count ?? 0;
                    const full = count >= POOL_IDEA_CAPACITY;
                    return (
                    <label
                      key={idea.id}
                      className={`flex gap-3 rounded-xl border border-line p-3 text-start transition-colors has-checked:border-accent has-checked:bg-accent/8 ${
                        full ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="poolIdea"
                        value={idea.id}
                        checked={poolPick === idea.id}
                        onChange={() => setPoolPick(idea.id)}
                        disabled={full}
                        className="mt-1 h-4 w-4 shrink-0 accent-(--color-accent)"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <span className="font-semibold text-brand">{idea.title}</span>
                          {count > 0 && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                                full ? "bg-cloud text-(--muted-fg)" : "bg-accent/10 text-accent"
                              }`}
                            >
                              {full ? f.ideaPoolFull : f.ideaPoolSpots.replace("{n}", String(count))}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-(--muted-fg)">{idea.body}</span>
                        {idea.build && (
                          <span className="mt-1 block text-xs leading-relaxed text-(--muted-fg)">
                            <span className="font-semibold text-brand">{f.ideaPoolBuild}</span> {idea.build}
                          </span>
                        )}
                      </span>
                    </label>
                    );
                  })}
                </div>
                {usage === null && <p className="mt-2 text-sm text-(--muted-fg)">{f.ideaPoolLoading}</p>}
                {pickedTaken && pickedTaken.count > 0 && (
                  <p role="status" className="mt-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm font-medium text-brand">
                    {f.ideaPoolJoin.replace("{names}", pickedTaken.names.join(locale === "he" ? " ו" : " & "))}
                  </p>
                )}
              </fieldset>
            )}
          </div>
          <TextArea id="aiDaily" name="aiDaily" label={f.aiDaily} placeholder={f.aiDailyPlaceholder} required rows={4} maxLength={workshopLimits.aiDaily} />
        </div>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message || (
            <>
              {t.errorTitle} {t.errorBody}{" "}
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
                {t.errorContact}
              </a>
            </>
          )}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-5 w-full disabled:opacity-60">
        {status === "sending" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
