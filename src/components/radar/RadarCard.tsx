"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/content/config";
import { radarCopy } from "@/content/radar";
import type { Content, Model, RadarEvent } from "@/lib/radar/schema";
import { eventState, displayDate } from "@/lib/radar/domain";
import { radarTheme, radarTextDirection } from "@/lib/radar/presentation";
import { RadarArtwork } from "./RadarArtwork";
export { displayDate } from "@/lib/radar/domain";

export function OutLink({
  href,
  children,
  className = "radar-link",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span aria-hidden> ↗</span>
    </a>
  );
}

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function EventTiming({
  event,
  locale,
}: {
  event: RadarEvent;
  locale: Locale;
}) {
  const t = radarCopy[locale];
  const now = useNow();
  const state = eventState(event, now ?? Date.now());
  const remaining = Math.ceil(
    (Date.parse(event.startsAt) - (now ?? Date.now())) / 3600000,
  );
  const labels = {
    upcoming: t.upcomingState,
    ongoing: t.ongoing,
    past: t.pastState,
    cancelled: t.cancelled,
    draft: t.draft,
  };
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`radar-badge ${state === "upcoming" || state === "ongoing" ? "radar-badge-blue" : ""}`}
        suppressHydrationWarning
      >
        {labels[state]}
      </span>
      {state === "upcoming" && (
        <span className="text-(--muted-fg)" suppressHydrationWarning>
          {t.startsIn} {remaining > 48 ? Math.ceil(remaining / 24) : remaining}{" "}
          {remaining > 48 ? t.days : t.hours}
        </span>
      )}
    </div>
  );
}

export function EventRegistration({
  event,
  locale,
}: {
  event: RadarEvent;
  locale: Locale;
}) {
  const now = useNow();
  const state = eventState(event, now ?? Date.now());
  const t = radarCopy[locale];
  return event.registration === "open" &&
    event.registrationUrl &&
    ["upcoming", "ongoing"].includes(state) ? (
    <OutLink
      href={
        event.benefitApproved && event.benefitUrl
          ? event.benefitUrl
          : event.registrationUrl
      }
      className="btn btn-primary"
    >
      {t.register}
    </OutLink>
  ) : (
    <span className="text-sm text-(--muted-fg)">
      {state === "past"
        ? t.pastState
        : state === "cancelled"
          ? t.cancelled
          : t.closed}
    </span>
  );
}

export function RadarCard({
  item,
  locale,
  onTag,
  onCompany,
  onCompare,
  selected = false,
  tagLabels = {},
  expanded = false,
}: {
  item: Content;
  locale: Locale;
  onTag?: (tag: string) => void;
  onCompany?: (id: string) => void;
  onCompare?: (model: Model) => void;
  selected?: boolean;
  tagLabels?: Record<string, string>;
  expanded?: boolean;
}) {
  const t = radarCopy[locale];
  const value = (text: { he: string; en: string }) => text[locale];
  const yesNo = (status: "yes" | "no" | "unknown") => t[status];
  const digest = item.kind === "news" && item.languageMode === "source-digest";
  return (
    <article
      className={`radar-card radar-card-${item.kind} radar-theme-${radarTheme(item)} ${expanded ? "radar-card-expanded" : ""}`}
      id={`item-${item.id}`}
    >
      <RadarArtwork item={item} locale={locale} />
      <div className="radar-card-body flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2.5 text-xs font-medium">
            <span className="radar-source-mark" aria-hidden>
              {item.sourceName.slice(0, 2)}
            </span>
            <bdi>{item.sourceName}</bdi>
          </span>
          {item.kind === "news" ? (
            <time
              className="text-xs text-(--muted-fg)"
              dateTime={item.publishedAt}
            >
              {displayDate(item.publishedAt, locale)}
            </time>
          ) : (
            <span className="radar-badge">{t[item.kind]}</span>
          )}
        </div>
        {item.featured && item.kind === "news" && <p className="radar-card-pick"><span aria-hidden>✦</span> {t.editorialPick}</p>}
        {item.kind === "events" && item.featured && (
          <p className="mb-3 text-xs font-medium text-accent">
            {t.eventFeatured}
          </p>
        )}
        {item.kind === "events" && (
          <div className="mb-3">
            <EventTiming event={item} locale={locale} />
          </div>
        )}
        {item.kind === "companies" && item.startup && (
          <span className="mb-3 text-xs font-medium text-accent">
            {t.startupWatch}
            {item.israeli ? " · IL" : ""}
          </span>
        )}
        {item.kind === "tools" && item.buildersPick && (
          <span className="mb-3 radar-badge radar-badge-blue w-fit">
            {t.pick}
          </span>
        )}
        <h3
          className="radar-card-title text-xl font-medium leading-snug tracking-tight text-brand"
          dir={radarTextDirection(value(item.title))}
        >
          {item.kind === "news" ? (
            expanded ? value(item.title) : <Link href={`/${locale}/ai-radar/news/${item.id}`} className="hover:text-accent">{value(item.title)}</Link>
          ) : <OutLink href={item.sourceUrl} className="hover:text-accent">{value(item.title)}</OutLink>}
        </h3>
        {item.kind === "news" && item.languageMode === "source-digest" && (
          <p
            className="mt-2 text-[11px] text-(--muted-fg)"
            title={t.digestNote}
          >
            {t.digest}
          </p>
        )}
        {(!digest || expanded) && <p className="radar-card-summary mt-3 text-sm leading-7 text-(--muted-fg)">
          {value(item.summary)}
        </p>}

        {item.kind === "news" && (!digest || expanded) && (
          <div className="radar-card-why my-4">
            <p className="mb-1 text-xs font-medium text-accent">{t.why}</p>
            <p className="text-sm leading-6">{value(item.why)}</p>
          </div>
        )}
        {item.kind === "models" && (
          <>
            <dl className="radar-facts my-4">
              <dt>{t.release}</dt>
              <dd>{displayDate(item.releasedAt, locale)}</dd>
              <dt>{t.api}</dt>
              <dd>{yesNo(item.api)}</dd>
              <dt>{t.openWeights}</dt>
              <dd>{yesNo(item.openWeights)}</dd>
            </dl>
            <details className="radar-details">
              <summary>
                {t.technical} <span aria-hidden>+</span>
              </summary>
              <dl className="space-y-4 py-4">
                {[
                  [t.version, item.version],
                  [t.modalities, item.modalities.join(" · ")],
                  [t.capabilities, value(item.capabilities)],
                  [t.changes, value(item.changes)],
                  [t.buildIdeas, value(item.buildIdeas)],
                  [
                    t.pricing,
                    item.pricingUrl && item.verifiedAt
                      ? value(item.pricing)
                      : t.unknown,
                  ],
                ].map(([label, text]) => (
                  <div key={label}>
                    <dt className="mb-1 text-xs font-medium text-accent">
                      {label}
                    </dt>
                    <dd className="text-sm leading-6" dir="auto">
                      {text}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs font-medium text-accent">
                    {t.benchmarks}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {item.benchmarks.length
                      ? item.benchmarks.map((b) => (
                          <p key={b.name}>
                            <OutLink href={b.sourceUrl}>
                              {b.name}: {b.value}
                            </OutLink>{" "}
                            ·{" "}
                            {b.attribution === "vendor"
                              ? locale === "he"
                                ? "לפי היצרן"
                                : "Vendor report"
                              : locale === "he"
                                ? "מקור עצמאי"
                                : "Independent"}{" "}
                            · {displayDate(b.measuredAt, locale)}
                          </p>
                        ))
                      : t.noBenchmarks}
                  </dd>
                </div>
              </dl>
              <p className="mb-4 text-xs leading-5 text-(--muted-fg)">
                {t.vendor}
              </p>
              <OutLink href={item.docsUrl}>{t.docs}</OutLink>
              {item.pricingUrl && (
                <p className="mt-2">
                  <OutLink href={item.pricingUrl}>{t.pricing}</OutLink>
                </p>
              )}
            </details>
          </>
        )}
        {item.kind === "companies" && (
          <>
            <dl className="radar-facts my-4">
              <dt>{t.country}</dt>
              <dd>{value(item.country)}</dd>
              <dt>{t.product}</dt>
              <dd>{value(item.product)}</dd>
            </dl>
            <p className="text-xs leading-5 text-(--muted-fg)">
              {value(item.announcements)}
            </p>
            {onCompany && (
              <button
                className="radar-link mt-3 self-start"
                onClick={() => onCompany(item.id)}
              >
                {t.related} <span aria-hidden>↗</span>
              </button>
            )}
          </>
        )}
        {item.kind === "tools" && (
          <>
            <dl className="my-4 space-y-3 text-sm">
              <div>
                <dt className="mb-1 text-xs font-medium text-accent">
                  {t.uses}
                </dt>
                <dd className="leading-6">{value(item.uses)}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-medium text-accent">
                  {t.audience}
                </dt>
                <dd>{value(item.audience)}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {item.openSource && (
                <OutLink href={item.licenseUrl} className="radar-badge">
                  {t.openSource}
                </OutLink>
              )}
              {item.freePlan !== "unknown" && (
                <OutLink href={item.freePlanSource} className="radar-badge">
                  {t.freePlan}: {yesNo(item.freePlan)}
                </OutLink>
              )}
            </div>
            {item.buildersPick && (
              <p className="mt-3 text-xs leading-6">
                {t.pickNote} {item.pickReason?.[locale]}
              </p>
            )}
          </>
        )}
        {item.kind === "events" && (
          <>
            <dl className="radar-facts my-4">
              <dt>{t.organizer}</dt>
              <dd>
                <bdi>{item.organizer}</bdi>
              </dd>
              <dt>{locale === "he" ? "מועד" : "When"}</dt>
              <dd>
                <time dateTime={item.startsAt}>
                  {displayDate(item.startsAt, locale, item.timezone)}
                </time>
                <span className="mt-1 block" dir="ltr">
                  {new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: item.timezone,
                  }).format(new Date(item.startsAt))}
                  {" – "}
                  {new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: item.timezone,
                  }).format(new Date(item.endsAt))}
                </span>
                {displayDate(item.startsAt, locale, item.timezone) !==
                  displayDate(item.endsAt, locale, item.timezone) && (
                  <time className="mt-1 block" dateTime={item.endsAt}>
                    {displayDate(item.endsAt, locale, item.timezone)}
                  </time>
                )}
                <span className="mt-1 block text-[11px]" dir="ltr">
                  {item.timezone}
                </span>
              </dd>
              <dt>{t.location}</dt>
              <dd>{item.online ? t.online : value(item.location)}</dd>
              <dt>{t.audience}</dt>
              <dd>{value(item.audience)}</dd>
              <dt>{t.cost}</dt>
              <dd>{value(item.cost)}</dd>
            </dl>
            <p className="mb-3 text-xs leading-6 text-accent">
              {item.relationship === "partner"
                ? `${t.collaboration} ${item.organizer}.`
                : t[item.relationship]}
            </p>
            {item.benefitApproved && item.benefit && (
              <div className="mb-4 rounded-xl border border-accent/15 bg-cloud p-3">
                <p className="text-xs font-medium text-accent">{t.benefit}</p>
                <p className="mt-1 text-sm">{value(item.benefit)}</p>
                {item.discountCode && (
                  <p className="mt-2 text-xs">
                    {t.discountCode}:{" "}
                    <code className="font-semibold" dir="ltr">
                      {item.discountCode}
                    </code>
                  </p>
                )}
              </div>
            )}
          </>
        )}
        <div className="mt-auto pt-5">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {[...new Set([...item.categories, ...item.tags])]
              .slice(0, item.kind === "news" && !expanded ? 3 : 7)
              .map((tag) =>
                onTag ? (
                  <button
                    key={tag}
                    onClick={() => onTag(tag)}
                    className="radar-tag"
                  >
                    {tagLabels[tag] || tag}
                  </button>
                ) : (
                  <span key={tag} className="radar-tag">
                    {tagLabels[tag] || tag}
                  </span>
                ),
              )}
          </div>
          {item.kind === "models" && onCompare ? (
            <button
              className={`btn w-full ${selected ? "btn-primary" : "btn-ghost"}`}
              aria-pressed={selected}
              onClick={() => onCompare(item)}
            >
              <span aria-hidden>{selected ? "✓" : "+"}</span>{" "}
              {selected ? t.compareRemove : t.compareSelect}
            </button>
          ) : item.kind === "events" ? (
            <div className="flex flex-wrap items-center gap-4">
              <EventRegistration event={item} locale={locale} />
              {item.agendaUrl && (
                <OutLink href={item.agendaUrl}>{t.agenda}</OutLink>
              )}
            </div>
          ) : (
            <OutLink href={item.sourceUrl}>{t.source}</OutLink>
          )}
          {item.verifiedAt && item.kind !== "news" && (
            <p className="mt-4 text-[11px] text-(--muted-fg)">
              {t.verified}:{" "}
              <time dateTime={item.verifiedAt}>
                {displayDate(item.verifiedAt, locale)}
              </time>
            </p>
          )}
          <p className="mt-4">
            <Link
              href={`/${locale}/ai-radar/${item.kind}/${item.id}`}
              className="radar-link text-xs"
            >
              {t.details} <span aria-hidden>→</span>
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}

export function ModelComparison({
  models,
  locale,
  onClear,
}: {
  models: Model[];
  locale: Locale;
  onClear: () => void;
}) {
  const t = radarCopy[locale];
  const rows: [string, (model: Model) => string][] = [
    [t.company, (m) => m.sourceName],
    [t.version, (m) => m.version],
    [t.release, (m) => displayDate(m.releasedAt, locale)],
    [t.modalities, (m) => m.modalities.join(" · ")],
    [t.api, (m) => t[m.api]],
    [t.openWeights, (m) => t[m.openWeights]],
    [t.capabilities, (m) => m.capabilities[locale]],
    [t.changes, (m) => m.changes[locale]],
    [t.buildIdeas, (m) => m.buildIdeas[locale]],
    [
      t.pricing,
      (m) => (m.pricingUrl && m.verifiedAt ? m.pricing[locale] : t.unknown),
    ],
  ];
  return (
    <section
      aria-label={t.compare}
      className="radar-comparison mb-8 rounded-2xl border border-accent/30 bg-white p-5 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="h3 text-brand">
            {t.compare} <span className="text-accent">{models.length}/3</span>
          </h2>
          <p className="mt-2 text-sm text-(--muted-fg)">{t.compareHelp}</p>
        </div>
        <button onClick={onClear} className="radar-link">
          {t.closeCompare} ×
        </button>
      </div>
      {models.length >= 2 && (
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label={t.compare}
        >
          <table className="w-full min-w-[600px] text-start text-sm">
            <caption className="sr-only">{t.compare}</caption>
            <thead>
              <tr>
                <th scope="col" className="p-3 text-start">
                  {t.technical}
                </th>
                {models.map((m) => (
                  <th
                    scope="col"
                    key={m.id}
                    className="p-3 text-start font-medium text-accent"
                  >
                    <OutLink href={m.sourceUrl}>{m.title[locale]}</OutLink>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, read]) => (
                <tr key={label} className="border-t border-line">
                  <th
                    scope="row"
                    className="min-w-32 p-3 text-start align-top font-medium text-(--muted-fg)"
                  >
                    {label}
                  </th>
                  {models.map((m) => (
                    <td key={m.id} className="min-w-48 p-3 align-top leading-6">
                      {read(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs leading-6 text-(--muted-fg)">
        {t.vendor} {t.noBenchmarks}
      </p>
    </section>
  );
}
