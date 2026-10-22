"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/content/config";
import { radarCopy } from "@/content/radar";
import type { RadarData, RadarQuery } from "@/lib/radar/data";
import type { Content, Model } from "@/lib/radar/schema";
import { ModelComparison, RadarCard, displayDate } from "./RadarCard";

const kinds = [
  "all",
  "news",
  "models",
  "companies",
  "tools",
  "events",
] as const;
export function RadarExplorer({
  locale,
  initial,
  initialQuery,
  children,
}: {
  locale: Locale;
  initial: RadarData;
  initialQuery: RadarQuery;
  children?: ReactNode;
}) {
  const t = radarCopy[locale];
  const [query, setQuery] = useState<RadarQuery>({
    kind: "news",
    sort: "newest",
    ...initialQuery,
    page: 1,
  });
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [compareError, setCompareError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const change = (next: Partial<RadarQuery>) =>
    setQuery((q) => ({ ...q, ...next, page: 1 }));
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    const timeout = setTimeout(async () => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query))
        if (value) params.set(key, String(value));
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params}`,
      );
      try {
        const response = await fetch(`/api/radar?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error();
        const next: RadarData = await response.json();
        setData((old) => ({
          ...next,
          items:
            query.page && query.page > 1
              ? [
                  ...old.items,
                  ...next.items.filter(
                    (item) => !old.items.some((v) => v.id === item.id),
                  ),
                ]
              : next.items,
        }));
      } catch {
        if (!controller.signal.aborted) setError(t.unavailable);
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, t.unavailable]);

  // Refresh saved browser pages too: Safari can restore an earlier empty result
  // from its back/forward cache without mounting this component again.
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setQuery((q) => ({ ...q }));
    };
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };
    const id = setInterval(refresh, 60000);
    window.addEventListener("pageshow", restored);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function compare(model: Model) {
    setCompareError("");
    if (models.some((m) => m.id === model.id))
      setModels(models.filter((m) => m.id !== model.id));
    else if (models.length === 3) setCompareError(t.compareLimit);
    else setModels([...models, model]);
  }
  const label = (key: string) => t[key as keyof typeof t] || key;
  const heading =
    query.kind === "news"
      ? t.latest
      : query.kind === "events"
        ? t.eventTitle
        : label(query.kind || "all");
  const reset = () => {
    setQuery({ kind: "news", sort: "newest", page: 1 });
    inputRef.current?.focus();
  };
  const scope =
    query.kind === "tools"
      ? "tool"
      : query.kind === "companies"
        ? "industry"
        : "topic";
  const categories = data.categories.filter(
    (c) => c.scope === scope || c.scope === "tag",
  );
  const tagLabels = Object.fromEntries(
    data.categories.map((c) => [c.id, c.title[locale]]),
  );
  const select = (
    key: keyof RadarQuery,
    text: string,
    options: { value: string; label: string }[],
  ) => (
    <label className="radar-filter">
      <span>{text}</span>
      <select
        value={String(query[key] || "")}
        onChange={(e) => change({ [key]: e.target.value })}
        className="field"
      >
        <option value="">{text}</option>
        {query[key] &&
          !options.some((option) => option.value === query[key]) && (
            <option value={String(query[key])}>{String(query[key])}</option>
          )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      <div className="shell relative -mt-7 z-10">
        <div className="radar-search-panel">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-3 border-b border-line p-4 sm:px-6 sm:py-5"
          >
            <svg
              aria-hidden
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="shrink-0 text-accent"
            >
              <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="1.7" />
              <path d="m16 16 4 4" strokeWidth="1.7" />
            </svg>
            <label className="sr-only" htmlFor="radar-search">
              {t.searchLabel}
            </label>
            <input
              ref={inputRef}
              id="radar-search"
              type="search"
              maxLength={200}
              value={query.q || ""}
              onChange={(e) =>
                change({
                  q: e.target.value,
                  kind: e.target.value ? "all" : query.kind,
                  category: "",
                  company: "",
                  group: "",
                  sort: "newest",
                })
              }
              placeholder={t.search}
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-(--muted-fg) sm:text-lg"
            />
            <span className="hidden text-[10px] tracking-widest text-(--muted-fg) md:block">
              AI RADAR SEARCH
            </span>
          </form>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            <button
              className="radar-tag"
              onClick={() =>
                setQuery({ kind: "news", sort: "newest", page: 1 })
              }
            >
              {t.latest} <span aria-hidden>↗</span>
            </button>
            <button
              className="radar-tag"
              onClick={() =>
                setQuery({
                  kind: "events",
                  sort: "newest",
                  page: 1,
                  eventState: "upcoming",
                })
              }
            >
              {t.upcoming} <span aria-hidden>↗</span>
            </button>
            <span className="ms-auto hidden text-xs text-(--muted-fg) sm:block">
              {data.sourceCount} {t.connected}
            </span>
          </div>
        </div>
      </div>

      {children}
      <section
        className="shell pb-16 pt-10"
        id="radar-content"
        aria-label={t.all}
      >
        <nav
          aria-label={locale === "he" ? "סוג תוכן" : "Content type"}
          className="radar-tabs"
        >
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() =>
                change({
                  kind,
                  category: "",
                  sort: "newest",
                  eventState: kind === "events" ? "upcoming" : "",
                  group: "",
                })
              }
              aria-current={query.kind === kind ? "page" : undefined}
              className={query.kind === kind ? "active" : ""}
            >
              {t[kind]}{" "}
              <span>
                {kind === "all"
                  ? Object.values(data.counts).reduce((a, b) => a + b, 0)
                  : data.counts[kind] || 0}
              </span>
            </button>
          ))}
        </nav>
        <div className="mb-6 mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              {query.kind === "events"
                ? "AI EVENTS / FUTURE BUILDERS"
                : "THE SIGNAL, WITHOUT THE NOISE"}
            </p>
            <h2 className="h2 mt-3 text-brand">{heading}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-(--muted-fg)">
              {query.kind === "events"
                ? t.eventIntro
                : query.kind === "models"
                  ? t.compareHelp
                  : query.kind === "companies"
                    ? t.startupNote
                    : query.kind === "tools"
                      ? t.toolIntro
                      : t.methodologyBody}
            </p>
          </div>
          <p
            className="text-xs text-(--muted-fg)"
            role="status"
            aria-live="polite"
          >
            {busy ? t.loading : `${data.total} ${t.results}`}
          </p>
        </div>
        {query.kind === "companies" && (
          <div className="mb-5 flex flex-wrap gap-2">
            <button
              className={`radar-tag ${query.group === "startups" ? "radar-badge-blue" : ""}`}
              aria-pressed={query.group === "startups"}
              onClick={() =>
                change({
                  group: query.group === "startups" ? "" : "startups",
                  category: "",
                })
              }
            >
              {t.startupWatch} ↗
            </button>
            <button
              className="radar-tag"
              onClick={() => change({ category: "israeli", group: "startups" })}
            >
              {locale === "he" ? "סטארטאפים ישראליים" : "Israeli AI startups"}
            </button>
          </div>
        )}
        {query.kind === "tools" && (
          <div className="mb-5">
            <button
              className={`radar-tag ${query.group === "picks" ? "radar-badge-blue" : ""}`}
              aria-pressed={query.group === "picks"}
              onClick={() =>
                change({ group: query.group === "picks" ? "" : "picks" })
              }
            >
              {t.pick} ↗
            </button>
          </div>
        )}
        <div className="radar-filters mb-5">
          {select(
            "category",
            t.allTopics,
            categories.map((c) => ({ value: c.id, label: c.title[locale] })),
          )}
          {query.kind !== "events" &&
            select(
              "company",
              t.allCompanies,
              data.companies.map((c) => ({
                value: c.id,
                label: c.title[locale],
              })),
            )}
          {query.kind !== "events" && (
            <label className="radar-filter">
              <span>{t.sort}</span>
              <select
                className="field"
                value={query.sort || "newest"}
                onChange={(e) => change({ sort: e.target.value })}
              >
                {[
                  ["newest", t.newest],
                  ["important", t.important],
                  ["models", t.newModels],
                  ["developers", t.developers],
                  ["startups", t.startups],
                ].map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          )}
          {query.kind === "events" && (
            <>
              <label className="radar-filter">
                <span>{t.eventFilter}</span>
                <select
                  value={query.eventState || ""}
                  onChange={(e) => change({ eventState: e.target.value })}
                  className="field"
                >
                  {[
                    ["upcoming", t.future],
                    ["past", t.past],
                    ["cancelled", t.cancelled],
                    ["all", t.allEvents],
                  ].map(([v, text]) => (
                    <option key={v} value={v}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
              {select(
                "organizer",
                t.allOrganizers,
                data.organizers.map((v) => ({ value: v, label: v })),
              )}
              {select(
                "location",
                t.allLocations,
                data.locations.map((v) => ({ value: v, label: v })),
              )}
              {select(
                "eventType",
                t.allTypes,
                [
                  "conference",
                  "workshop",
                  "networking",
                  "hackathon",
                  "meetup",
                  "online",
                ].map((v) => ({ value: v, label: label(v) })),
              )}
            </>
          )}
          {query.kind !== "events" && (
            <>
              <label className="radar-filter">
                <span>{t.since}</span>
                <input
                  type="date"
                  className="field"
                  value={query.since || ""}
                  onChange={(e) => change({ since: e.target.value })}
                />
              </label>
              <label className="radar-filter">
                <span>{t.until}</span>
                <input
                  type="date"
                  className="field"
                  value={query.until || ""}
                  onChange={(e) => change({ until: e.target.value })}
                />
              </label>
            </>
          )}
        </div>
        {query.kind === "events" && (
          <div className="mb-6 grid max-w-md grid-cols-2 gap-3">
            <label className="radar-filter">
              <span>{t.since}</span>
              <input
                type="date"
                className="field"
                value={query.since || ""}
                onChange={(e) => change({ since: e.target.value })}
              />
            </label>
            <label className="radar-filter">
              <span>{t.until}</span>
              <input
                type="date"
                className="field"
                value={query.until || ""}
                onChange={(e) => change({ until: e.target.value })}
              />
            </label>
          </div>
        )}
        {(query.q ||
          query.category ||
          query.company ||
          query.since ||
          query.until) && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button className="radar-link text-xs" onClick={reset}>
              {t.reset} ×
            </button>
            {query.category && (
              <span className="radar-badge">
                {data.categories.find((c) => c.id === query.category)?.title[
                  locale
                ] || query.category}
              </span>
            )}
            {query.company && (
              <span className="radar-badge">
                {
                  data.companies.find((c) => c.id === query.company)?.title[
                    locale
                  ]
                }
              </span>
            )}
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
          >
            {error}
          </p>
        )}
        {models.length > 0 && (
          <ModelComparison
            models={models}
            locale={locale}
            onClear={() => {
              setModels([]);
              setCompareError("");
            }}
          />
        )}
        {compareError && (
          <p role="alert" className="mb-4 text-sm text-accent">
            {compareError}
          </p>
        )}
        {data.items.length ? (
          <div
            className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3"
            aria-busy={busy}
          >
            {data.items.map((item: Content) => (
              <RadarCard
                key={item.id}
                item={item}
                locale={locale}
                tagLabels={tagLabels}
                onTag={(tag) => change({ category: tag })}
                onCompany={(id) =>
                  change({
                    company: id,
                    kind: "all",
                    category: "",
                    group: "",
                    sort: "newest",
                  })
                }
                onCompare={compare}
                selected={models.some((m) => m.id === item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="radar-empty">
            <span aria-hidden className="text-5xl font-light text-accent/50">
              ◎
            </span>
            <h3 className="h3 mt-4 text-brand">{t.empty}</h3>
            <p className="mt-3 text-sm text-(--muted-fg)">{t.emptyBody}</p>
            <button onClick={reset} className="btn btn-ghost mt-5">
              {t.reset}
            </button>
          </div>
        )}
        {data.hasMore && (
          <div className="mt-8 text-center">
            <button
              disabled={busy}
              onClick={() =>
                setQuery((q) => ({ ...q, page: (q.page || 1) + 1 }))
              }
              className="btn btn-ghost disabled:opacity-50"
            >
              {busy ? t.loading : t.more} <span aria-hidden>↓</span>
            </button>
          </div>
        )}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-xs text-(--muted-fg)">
          <p>
            {t.updated}:{" "}
            {data.lastRefresh
              ? displayDate(data.lastRefresh, locale, "Asia/Jerusalem", true)
              : t.never}
          </p>
          <a href="#radar-methodology" className="radar-link">
            {t.methodology} ↗
          </a>
        </div>
      </section>
    </>
  );
}
