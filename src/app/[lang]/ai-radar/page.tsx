import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contact, isLocale } from "@/content/config";
import { radarCopy } from "@/content/radar";
import { radarData, featuredContent, queryFromParams } from "@/lib/radar/data";
import { jsonLd, displayDate } from "@/lib/radar/domain";
import { RadarExplorer } from "@/components/radar/RadarExplorer";
import { RadarLead } from "@/components/radar/RadarLead";
import type { News } from "@/lib/radar/schema";
import { radarTheme } from "@/lib/radar/presentation";

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
  const [data, featured, priority] = await Promise.all([
    radarData(query),
    featuredContent(),
    radarData({ kind: "news", sort: "newest", limit: 12 }),
  ]);
  const highlights = priority.items.filter((item): item is News => item.kind === "news");
  const story = featured.story || highlights[0];
  const sideStories: News[] = [];
  const usedThemes = new Set(story ? [radarTheme(story)] : []);
  for (const item of highlights) {
    if (item.id === story?.id || usedThemes.has(radarTheme(item))) continue;
    sideStories.push(item);
    usedThemes.add(radarTheme(item));
    if (sideStories.length === 2) break;
  }
  for (const item of highlights) {
    if (sideStories.length === 2) break;
    if (item.id !== story?.id && !sideStories.some((value) => value.id === item.id)) sideStories.push(item);
  }
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
      <section className="radar-masthead">
        <div className="shell">
          <div className="radar-edition-line"><span>{t.eyebrow}</span><span className="radar-edition-note">IDEAS MOVE FAST. STAY CURIOUS. <span aria-hidden>✳</span></span></div>
          <div className="radar-masthead-grid">
            <h1 className="radar-wordmark" dir="ltr">
              AI RADAR<span className="text-accent">.</span>
            </h1>
            <div className="radar-masthead-copy">
              <h2>{t.heroHeadline}</h2>
              <p>{t.heroIntro}</p>
              <a className="radar-masthead-link" href="#radar-content">{t.browseFeed}<span aria-hidden>↓</span></a>
            </div>
          </div>
          <div className="radar-edition-status">
            <div className="flex items-center gap-2">
              <span className={`radar-live-dot ${data.unavailable || data.sourceFailures || stale || !data.lastRefresh ? "radar-dot-amber" : ""}`} aria-hidden />
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
            <span>{data.counts.news || 0} {t.news} <span aria-hidden> / </span> {data.sourceCount} {t.connected}</span>
          </div>
        </div>
      </section>
      <RadarExplorer locale={lang} initial={data} initialQuery={query}>
        {story && <RadarLead story={story} sideStories={sideStories} locale={lang} />}
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
