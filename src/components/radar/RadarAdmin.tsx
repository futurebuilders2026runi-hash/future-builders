"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Locale } from "@/content/config";
import { radarCopy, radarFields } from "@/content/radar";
import {
  collections,
  type Collection,
  type RadarRecord,
  type ImportJob,
  type Audit,
  type Review,
} from "@/lib/radar/schema";
import { draftRecord } from "@/lib/radar/templates";
import { eventState } from "@/lib/radar/domain";
import { displayDate } from "./RadarCard";

type AdminData = Record<Collection, RadarRecord[]> & {
  jobs: ImportJob[];
  audit: Audit[];
  reviews: Review[];
  storage: string;
};
const options: Record<string, string[]> = {
  status: ["draft", "review", "published", "hidden"],
  languageMode: ["edited", "source-digest"],
  api: ["unknown", "yes", "no"],
  openWeights: ["unknown", "yes", "no"],
  freePlan: ["unknown", "yes", "no"],
  relationship: ["club", "partner", "recommended", "external"],
  eventType: [
    "conference",
    "workshop",
    "networking",
    "hackathon",
    "meetup",
    "online",
  ],
  eventStatus: ["draft", "scheduled", "cancelled"],
  registration: ["unknown", "open", "closed"],
  scope: ["topic", "industry", "tool", "tag"],
  attribution: ["vendor", "independent"],
};
const hiddenFields = ["kind", "id", "updatedAt", "discoveredAt"];

export function RadarAdmin({ locale }: { locale: Locale }) {
  const t = radarCopy[locale];
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<string>("news");
  const [editor, setEditor] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [find, setFind] = useState("");
  const [rights, setRights] = useState(false);
  const translate = (key: string) =>
    (t as Record<string, string>)[key] ||
    (
      {
        scheduled: locale === "he" ? "מתוכנן" : "Scheduled",
        open: locale === "he" ? "פתוחה" : "Open",
        closed: t.closed,
        edited: locale === "he" ? "ערוך ומתורגם" : "Edited & translated",
        "source-digest": t.digest,
        vendor: locale === "he" ? "לפי היצרן" : "Vendor",
        independent: locale === "he" ? "מקור עצמאי" : "Independent",
        topic: locale === "he" ? "נושא" : "Topic",
        industry: locale === "he" ? "תעשייה" : "Industry",
        tool: t.tools,
        tag: locale === "he" ? "תגית" : "Tag",
      } as Record<string, string>
    )[key] ||
    key;
  async function refresh() {
    try {
      const response = await fetch("/api/admin/radar", { cache: "no-store" });
      if (!response.ok) throw new Error();
      setData(await response.json());
    } catch {
      setError(t.adminError);
    }
  }
  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function edit(record: RadarRecord | Record<string, unknown>) {
    const template = draftRecord(record.kind as Collection);
    setEditor({ ...template, ...structuredClone(record) });
    setRights(false);
    setError("");
    setMessage("");
    setTimeout(
      () =>
        document
          .getElementById("radar-editor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  }
  async function action(action: string, record?: unknown) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, record }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(
          result.issues
            ? result.issues
                .map(
                  (v: { path: string; message: string }) =>
                    `${v.path}: ${v.message}`,
                )
                .join("\n")
            : `${t.adminError} (${result.error || response.status})`,
        );
        return;
      }
      if (action === "save") {
        setEditor(null);
        setMessage(t.saved);
      } else if (action === "import") {
        const job = result.job as ImportJob;
        setMessage(
          `${translate(job.status === "partial" ? "partialJob" : job.status)} · ${job.inserted} ${t.imported} · ${job.duplicates} ${t.duplicates} · ${job.rejected} ${t.rejected}`,
        );
      } else setMessage(t.saved);
      await refresh();
    } catch {
      setError(t.adminError);
    } finally {
      setBusy(false);
    }
  }

  function update(path: string[], value: unknown) {
    setEditor((current) => {
      if (!current) return current;
      const copy = structuredClone(current);
      let node: Record<string, unknown> = copy;
      for (const key of path.slice(0, -1))
        node = node[key] as Record<string, unknown>;
      node[path[path.length - 1]] = value;
      return copy;
    });
  }

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("rightsConfirmed", String(rights));
      const response = await fetch("/api/admin/radar/media", {
        method: "POST",
        body,
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      update(["image"], result.image);
    } catch {
      setError(t.adminError);
    } finally {
      setBusy(false);
    }
  }

  const field = (
    name: string,
    value: unknown,
    path: string[] = [name],
  ): React.ReactNode => {
    const label = radarFields[name]?.[locale] || name;
    const id = `edit-${path.join("-")}`;
    if (hiddenFields.includes(name)) return null;
    if (name === "image")
      return (
        <fieldset key={id} className="radar-admin-fieldset sm:col-span-2">
          <legend>{label}</legend>
          <label className="field-label" htmlFor={id}>
            {label}
          </label>
          <input
            id={id}
            className="field"
            dir="ltr"
            value={String(value)}
            onChange={(e) => update(path, e.target.value)}
          />
          <p className="my-3 text-xs leading-6 text-(--muted-fg)">
            {t.imageNote}
          </p>
          <label className="mb-3 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={rights}
              onChange={(e) => setRights(e.target.checked)}
            />
            {t.rightsConfirmed}
          </label>
          <label className="field-label">
            {t.uploadImage}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              disabled={!rights || busy}
              className="field mt-2"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
        </fieldset>
      );
    if (value && typeof value === "object" && !Array.isArray(value))
      return (
        <fieldset key={id} className="radar-admin-fieldset sm:col-span-2">
          <legend>{label}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(value).map(([key, v]) => (
              <label key={key} className="min-w-0">
                <span className="field-label">
                  {key === "he" ? "עברית" : key === "en" ? "English" : key}
                </span>
                <textarea
                  id={`${id}-${key}`}
                  aria-label={`${label} ${key}`}
                  value={String(v)}
                  onChange={(e) => update([...path, key], e.target.value)}
                  className="field"
                  dir={key === "he" ? "rtl" : "ltr"}
                />
              </label>
            ))}
          </div>
        </fieldset>
      );
    if (Array.isArray(value)) {
      if ((name === "categories" || name === "companyIds") && data) {
        const available =
          name === "categories" ? data.categories : data.companies;
        return (
          <fieldset key={id} className="radar-admin-fieldset sm:col-span-2">
            <legend>{label}</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 text-xs leading-6"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.id)}
                    onChange={(e) =>
                      update(
                        path,
                        e.target.checked
                          ? [...value, option.id]
                          : value.filter((v) => v !== option.id),
                      )
                    }
                  />
                  {option.title[locale]}
                </label>
              ))}
            </div>
          </fieldset>
        );
      }
      if (name === "benchmarks")
        return (
          <fieldset key={id} className="radar-admin-fieldset sm:col-span-2">
            <legend>{label}</legend>
            {value.map((benchmark, index) => (
              <div key={index} className="mb-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(benchmark).map(([key, v]) =>
                  field(key, v, [...path, String(index), key]),
                )}
                <button
                  type="button"
                  className="radar-link"
                  onClick={() =>
                    update(
                      path,
                      value.filter((_, i) => i !== index),
                    )
                  }
                >
                  × {t.hide}
                </button>
              </div>
            ))}
            <button
              type="button"
              className="radar-link"
              onClick={() =>
                update(path, [
                  ...value,
                  {
                    name: "",
                    value: "",
                    sourceUrl: "",
                    measuredAt: new Date().toISOString(),
                    attribution: "vendor",
                  },
                ])
              }
            >
              + {t.add}
            </button>
          </fieldset>
        );
      return (
        <label key={`${editor?.id}-${id}`} className="min-w-0">
          <span className="field-label">{label}</span>
          <input
            className="field"
            id={id}
            defaultValue={value.join(", ")}
            onChange={(e) =>
              update(
                path,
                e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              )
            }
            dir="auto"
          />
        </label>
      );
    }
    if (typeof value === "boolean")
      return (
        <label
          key={id}
          className="flex min-h-11 items-center gap-3 rounded-xl border border-line p-3 text-sm"
        >
          <input
            id={id}
            type="checkbox"
            checked={value}
            onChange={(e) => update(path, e.target.checked)}
            className="size-4 accent-accent"
          />
          {label}
        </label>
      );
    return (
      <label key={id} className="min-w-0">
        <span className="field-label">{label}</span>
        {name === "companyId" && data ? (
          <select
            id={id}
            className="field"
            value={String(value)}
            onChange={(e) => update(path, e.target.value)}
          >
            <option value="">{t.company}</option>
            {data.companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.title[locale]}
              </option>
            ))}
          </select>
        ) : options[name] ? (
          <select
            id={id}
            className="field"
            value={String(value)}
            onChange={(e) => update(path, e.target.value)}
          >
            {options[name].map((option) => (
              <option key={option} value={option}>
                {translate(option)}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={typeof value === "number" ? "number" : "text"}
            min={name === "importance" ? 0 : undefined}
            max={name === "importance" ? 100 : undefined}
            maxLength={4000}
            className="field"
            value={String(value ?? "")}
            onChange={(e) =>
              update(
                path,
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value,
              )
            }
            dir={/Url|At|timezone|url/.test(name) ? "ltr" : "auto"}
          />
        )}
      </label>
    );
  };
  const records = data
    ? tab === "reviews"
      ? collections
          .flatMap((kind) => data[kind])
          .filter((r) => "status" in r && r.status === "review")
      : data[tab as Collection] || []
    : [];
  const visible = records.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(find.toLowerCase()),
  );
  function download() {
    const link = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    link.href = url;
    link.download = `ai-radar-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const record = structuredClone(editor);
    for (const key of ["imageAlt", "pickReason", "benefit"]) {
      const value = record[key] as { he?: string; en?: string } | undefined;
      if (value && !value.he && !value.en) delete record[key];
    }
    void action("save", record);
  }
  return (
    <div className="radar-admin">
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={() => action("import")}
          className="btn btn-primary disabled:opacity-50"
        >
          {busy ? t.loading : t.import}
        </button>
        <button
          disabled={busy}
          onClick={() => action("seed")}
          className="btn btn-ghost"
        >
          {t.seed}
        </button>
        {data && (
          <button onClick={download} className="btn btn-ghost">
            {t.export}
          </button>
        )}
        <Link href={`/${locale}/ai-radar`} className="btn btn-ghost">
          {t.explore} ↗
        </Link>
      </div>
      {data && (
        <p className="mb-6 text-xs text-(--muted-fg)">
          {data.storage === "local" ? t.local : t.supabase}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-accent/20 bg-cloud p-4 text-sm"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <nav className="radar-tabs mb-6" aria-label={t.adminTitle}>
        {[...collections, "reviews", "jobs", "audit"].map((key) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setFind("");
            }}
            className={tab === key ? "active" : ""}
            aria-current={tab === key ? "page" : undefined}
          >
            {translate(key)}
          </button>
        ))}
      </nav>
      {!data && !error && <p role="status">{t.loading}</p>}
      {data && !["jobs", "audit"].includes(tab) && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <label className="min-w-40 flex-1">
              <span className="sr-only">{t.searchLabel}</span>
              <input
                className="field"
                type="search"
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder={t.search}
              />
            </label>
            {collections.includes(tab as Collection) && (
              <button
                className="btn btn-primary"
                onClick={() => edit(draftRecord(tab as Collection))}
              >
                + {t.add}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {visible.map((record) => (
              <article
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-4"
              >
                <div className="min-w-0">
                  <h2 className="font-medium text-brand" dir="auto">
                    {record.title[locale]}
                  </h2>
                  <p className="mt-1 break-all text-xs text-(--muted-fg)">
                    {record.id}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {"status" in record && (
                      <span className="radar-badge">
                        {translate(record.status)}
                      </span>
                    )}
                    {record.kind === "events" && (
                      <span className="radar-badge">
                        {translate(
                          eventState(record) === "upcoming"
                            ? "upcomingState"
                            : eventState(record) === "past"
                              ? "pastState"
                              : eventState(record),
                        )}
                      </span>
                    )}
                    {"featured" in record && record.featured && (
                      <span className="radar-badge radar-badge-blue">
                        {t.featuredStory}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={busy}
                    className="radar-link"
                    onClick={() => edit(record)}
                  >
                    {t.edit}
                  </button>
                  {"status" in record && (
                    <>
                      <button
                        disabled={busy}
                        className="radar-link"
                        onClick={() =>
                          action("save", {
                            ...record,
                            status:
                              record.status === "published"
                                ? "hidden"
                                : "published",
                          })
                        }
                      >
                        {record.status === "published" ? t.hide : t.approve}
                      </button>
                      <button
                        disabled={busy}
                        className="radar-link"
                        onClick={() =>
                          action("save", {
                            ...record,
                            featured: !record.featured,
                          })
                        }
                      >
                        {record.featured ? t.unfeature : t.feature}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
            {!visible.length && (
              <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-(--muted-fg)">
                {t.empty}
              </p>
            )}
          </div>
        </>
      )}
      {data && tab === "jobs" && (
        <div className="space-y-4">
          {!data.jobs.length && <p>{t.noJobs}</p>}
          {[...data.jobs]
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
            .map((job) => (
              <article
                key={job.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <p className="font-medium">
                  {translate(
                    job.status === "partial" ? "partialJob" : job.status,
                  )}{" "}
                  · {displayDate(job.startedAt, locale, "Asia/Jerusalem", true)}
                </p>
                <p className="mt-2 text-sm">
                  {job.inserted} {t.imported} · {job.duplicates} {t.duplicates}{" "}
                  · {job.rejected} {t.rejected}
                </p>
                <ul className="mt-3 space-y-2 text-xs text-(--muted-fg)">
                  {job.sources.map((source) => (
                    <li key={source.id}>
                      <bdi>{source.id}</bdi> · {translate(source.status)} ·{" "}
                      {source.inserted} {t.imported}
                      {source.error && (
                        <span className="ms-2 text-red-700" dir="ltr">
                          {source.error}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      )}
      {data && tab === "audit" && (
        <div className="space-y-3">
          {!data.audit.length && <p>{t.noAudit}</p>}
          {[...data.audit]
            .reverse()
            .slice(0, 100)
            .map((audit) => (
              <article
                key={audit.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4"
              >
                <div>
                  <p className="font-medium">{audit.after.title[locale]}</p>
                  <p className="mt-2 text-xs text-(--muted-fg)">
                    {displayDate(audit.at, locale, "Asia/Jerusalem", true)} ·{" "}
                    {audit.actor} · {audit.action}
                  </p>
                </div>
                {audit.before && (
                  <button
                    disabled={busy}
                    className="radar-link"
                    onClick={() => edit(audit.before!)}
                  >
                    {t.restore}
                  </button>
                )}
              </article>
            ))}
        </div>
      )}
      {editor && (
        <section
          id="radar-editor"
          className="mt-8 scroll-mt-24 rounded-2xl border border-accent/30 bg-white p-5 sm:p-7"
        >
          <div className="mb-5 flex justify-between gap-3">
            <h2 className="h3 text-brand">
              {t.edit} · {translate(String(editor.kind))}
            </h2>
            <button className="radar-link" onClick={() => setEditor(null)}>
              {t.cancel} ×
            </button>
          </div>
          <p className="mb-6 text-xs leading-6 text-(--muted-fg)">
            {t.formHelp}
          </p>
          {editor.kind === "sources" && (
            <p className="mb-5 text-sm">{t.sourceHelp}</p>
          )}
          <form onSubmit={save}>
            <div className="grid gap-5 sm:grid-cols-2">
              {Object.entries(editor).map(([key, value]) => field(key, value))}
            </div>
            <div className="sticky bottom-4 mt-6 flex w-fit flex-wrap gap-3 rounded-full border border-line bg-white/95 p-2 shadow-xl backdrop-blur">
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary disabled:opacity-50"
              >
                {busy ? t.saving : t.save}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditor(null)}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
