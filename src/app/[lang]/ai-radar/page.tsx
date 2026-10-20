import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contact, isLocale } from "@/content/config";
import { radarCopy } from "@/content/radar";
import { radarData, featuredContent, queryFromParams } from "@/lib/radar/data";
import { jsonLd, displayDate } from "@/lib/radar/domain";
import { RadarExplorer } from "@/components/radar/RadarExplorer";
import { OutLink } from "@/components/radar/RadarCard";
import { Waves } from "@/components/BrandDecor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = radarCopy[lang];
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${lang}/ai-radar`,
      languages: {
        he: "/he/ai-radar",
        en: "/en/ai-radar",
        "x-default": "/he/ai-radar",
      },
    },
    openGraph: {
      title: t.title,
      description: t.description,
      url: `/${lang}/ai-radar`,
      type: "website",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: ["/og.png"],
    },
  };
}

export default async function RadarPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = radarCopy[lang];
  const raw = await searchParams;
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(raw))
    if (typeof value === "string") p.set(key, value);
  const query = {
    ...queryFromParams(p),
    kind: p.get("kind") || (p.get("q") ? "all" : "news"),
    eventState:
      p.get("eventState") || (p.get("kind") === "events" ? "upcoming" : ""),
    page: 1,
  };
  const [data, featured] = await Promise.all([
    radarData(query),
    featuredContent(),
  ]);
  const story = featured.story;
  const stale =
    data.lastRefresh &&
    Date.now() - Date.parse(data.lastRefresh) > 26 * 3600000;
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Future Builders AI Radar",
        description: t.description,
        inLanguage: lang,
        url: `${contact.siteUrl}/${lang}/ai-radar`,
      },
      ...data.items
        .filter((i) => i.kind === "news")
        .map((i) => ({
          "@type": "NewsArticle",
          headline: i.title[lang],
          description: i.summary[lang],
          datePublished: i.publishedAt,
          dateModified: i.updatedAt,
          url: i.sourceUrl,
          isBasedOn: i.sourceUrl,
          inLanguage: lang,
          author: { "@type": "Organization", name: i.sourceName },
          publisher: { "@type": "Organization", name: "Future Builders" },
        })),
      ...[...data.items, ...(featured.event ? [featured.event] : [])]
        .filter((i) => i.kind === "events")
        .filter(
          (i, index, all) => all.findIndex((v) => v.id === i.id) === index,
        )
        .map((e) => ({
          "@type": "Event",
          name: e.title[lang],
          description: e.summary[lang],
          startDate: e.startsAt,
          endDate: e.endsAt,
          eventStatus:
            e.eventStatus === "cancelled"
              ? "https://schema.org/EventCancelled"
              : "https://schema.org/EventScheduled",
          eventAttendanceMode: e.online
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
          organizer: { "@type": "Organization", name: e.organizer },
          location: e.online
            ? { "@type": "VirtualLocation", url: e.sourceUrl }
            : {
                "@type": "Place",
                name: e.location[lang],
                address: e.location[lang],
              },
          url: e.sourceUrl,
          ...(e.image ? { image: `${contact.siteUrl}${e.image}` } : {}),
        })),
    ],
  };
  return (
    <div className="radar-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <section className="brand-sky relative overflow-hidden pb-20 pt-32 sm:pt-36">
        <div className="grid-veil" />
        <Waves className="opacity-45" lines={12} />
        <div className="shell relative grid items-center gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="radar-wordmark mt-6" dir="ltr">
              AI RADAR<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-accent sm:text-xl">
              {t.tagline}
            </p>
            <h2 className="mt-4 max-w-2xl text-2xl font-medium leading-snug text-brand sm:text-3xl">
              {t.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted-fg) sm:text-base">
              {t.intro}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-(--muted-fg)">
              <span
                className={`h-1.5 w-1.5 rounded-full ${data.unavailable || data.sourceFailures || stale || !data.lastRefresh ? "bg-amber-600" : "bg-accent"}`}
                aria-hidden
              />
              <span>
                {data.unavailable
                  ? t.unavailable
                  : data.sourceFailures
                    ? t.partial
                    : stale
                      ? t.stale
                      : data.lastRefresh
                        ? `${t.updated}: ${displayDate(data.lastRefresh, lang, "Asia/Jerusalem", true)}`
                        : t.never}
              </span>
            </div>
          </div>
          <div
            className="radar-orbit hidden lg:grid"
            aria-hidden="true"
            dir="ltr"
          >
            <div className="radar-sweep" />
            <div className="radar-ring radar-ring-1" />
            <div className="radar-ring radar-ring-2" />
            <div className="radar-ring radar-ring-3" />
            <span className="radar-cross-h" />
            <span className="radar-cross-v" />
            <span className="radar-dot radar-dot-1" />
            <span className="radar-dot radar-dot-2" />
            <span className="radar-dot radar-dot-3" />
            <span className="radar-center" />
            <span className="radar-orbit-label">FIND YOUR NEXT IDEA</span>
            <span className="radar-coord">32.1638° N / 34.8357° E</span>
          </div>
        </div>
      </section>
      <RadarExplorer locale={lang} initial={data} initialQuery={query}>
        {story && (
          <section className="shell pt-8" aria-label={t.featuredStory}>
            <div className="on-dark radar-feature relative overflow-hidden rounded-3xl bg-navy p-6 sm:p-10">
              <div className="grid-veil" />
              <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="eyebrow">{t.featured}</p>
                  <p className="mt-4 text-xs text-(--muted-fg)">
                    {story.sourceName} · {displayDate(story.publishedAt, lang)}
                  </p>
                  <h2 className="mt-3 max-w-3xl text-2xl font-medium leading-snug sm:text-4xl">
                    {story.title[lang]}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-(--muted-fg)">
                    {story.summary[lang]}
                  </p>
                  <p className="mt-4 text-xs leading-6 text-accent-bright">
                    {t.why} {story.kind === "news" ? story.why[lang] : ""}
                  </p>
                </div>
                <OutLink href={story.sourceUrl} className="btn btn-ghost w-fit">
                  {t.source}
                </OutLink>
              </div>
            </div>
          </section>
        )}
      </RadarExplorer>
      <section
        id="radar-methodology"
        className="border-t border-line bg-cloud py-10"
      >
        <div className="shell grid gap-4 md:grid-cols-[1fr_2fr]">
          <h2 className="text-lg font-medium text-brand">{t.methodology}</h2>
          <p className="max-w-3xl text-sm leading-7 text-(--muted-fg)">
            {t.methodologyBody}
          </p>
        </div>
      </section>
    </div>
  );
}
