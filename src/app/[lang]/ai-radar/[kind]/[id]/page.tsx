import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, contact } from "@/content/config";
import { radarCopy } from "@/content/radar";
import { get } from "@/lib/radar/store";
import { publicContent, jsonLd } from "@/lib/radar/domain";
import { RadarCard } from "@/components/radar/RadarCard";
import type { Content } from "@/lib/radar/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { lang: string; kind: string; id: string };
async function load({ kind, id }: Params): Promise<Content | null> {
  if (
    !["news", "models", "companies", "tools", "events"].includes(kind) ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(id)
  )
    return null;
  try {
    const record = await get(kind as Content["kind"], id);
    return record && publicContent(record) ? record : null;
  } catch {
    return null;
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const p = await params;
  if (!isLocale(p.lang)) return {};
  const item = await load(p);
  if (!item) return { robots: { index: false } };
  const path = `/ai-radar/${p.kind}/${p.id}`;
  return {
    title: `${item.title[p.lang]} | Future Builders AI Radar`,
    description: item.summary[p.lang],
    alternates: {
      canonical: `/${p.lang}${path}`,
      languages: { he: `/he${path}`, en: `/en${path}` },
    },
    openGraph: {
      title: item.title[p.lang],
      description: item.summary[p.lang],
      url: `/${p.lang}${path}`,
      type: item.kind === "news" ? "article" : "website",
      images: [item.image || "/og.png"],
    },
  };
}
export default async function RadarDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const p = await params;
  if (!isLocale(p.lang)) notFound();
  const item = await load(p);
  if (!item) notFound();
  const t = radarCopy[p.lang];
  const structured: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":
      item.kind === "events"
        ? "Event"
        : item.kind === "news"
          ? "NewsArticle"
          : "WebPage",
    name: item.title[p.lang],
    description: item.summary[p.lang],
    url: `${contact.siteUrl}/${p.lang}/ai-radar/${item.kind}/${item.id}`,
    inLanguage: p.lang,
  };
  if (item.kind === "news")
    Object.assign(structured, {
      headline: item.title[p.lang],
      datePublished: item.publishedAt,
      dateModified: item.updatedAt,
      isBasedOn: item.sourceUrl,
      author: { "@type": "Organization", name: item.sourceName },
      publisher: { "@type": "Organization", name: "Future Builders" },
    });
  if (item.kind === "events")
    Object.assign(structured, {
      startDate: item.startsAt,
      endDate: item.endsAt,
      eventStatus:
        item.eventStatus === "cancelled"
          ? "https://schema.org/EventCancelled"
          : "https://schema.org/EventScheduled",
      eventAttendanceMode: item.online
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location: item.online
        ? { "@type": "VirtualLocation", url: item.sourceUrl }
        : {
            "@type": "Place",
            name: item.location[p.lang],
            address: item.location[p.lang],
          },
      organizer: { "@type": "Organization", name: item.organizer },
      ...(item.image ? { image: `${contact.siteUrl}${item.image}` } : {}),
    });
  return (
    <section className="radar-page min-h-[70vh] pb-16 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <div className="shell max-w-3xl">
        <Link
          href={`/${p.lang}/ai-radar?kind=${item.kind}`}
          className="radar-link mb-6"
        >
          {p.lang === "he" ? "→" : "←"} AI Radar
        </Link>
        <h1 className="h2 mb-6 text-brand" dir="auto">
          {item.title[p.lang]}
        </h1>
        <RadarCard item={item} locale={p.lang} />
      </div>
    </section>
  );
}
