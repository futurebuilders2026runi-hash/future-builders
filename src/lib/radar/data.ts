import "server-only";
import {
  collections,
  type Content,
  type Category,
  type ImportJob,
  type News,
  type Model,
  type RadarEvent,
} from "./schema";
import { contentAvailableInLocale, eventState, matchesQuery, publicContent } from "./domain";
import { isLocale, locales, type Locale } from "@/content/config";
import { list } from "./store";

export type RadarQuery = {
  lang?: Locale;
  q?: string;
  kind?: string;
  category?: string;
  company?: string;
  since?: string;
  until?: string;
  sort?: string;
  eventState?: string;
  organizer?: string;
  location?: string;
  eventType?: string;
  group?: string;
  page?: number;
  limit?: number;
};
export type RadarData = {
  items: Content[];
  total: number;
  page: number;
  hasMore: boolean;
  counts: Record<string, number>;
  categories: Category[];
  companies: { id: string; title: { he: string; en: string } }[];
  organizers: string[];
  locations: string[];
  lastRefresh: string | null;
  sourceCount: number;
  sourceFailures: number;
  unavailable: boolean;
};
type Snapshot = {
  content: Content[];
  categories: Category[];
  jobs: ImportJob[];
  sourceCount: number;
  unavailable: boolean;
};
let memory: { at: number; value: Snapshot } | null = null;
let pending: Promise<Snapshot> | null = null;
export function invalidateRadar() {
  memory = null;
}

async function snapshot(): Promise<Snapshot> {
  if (memory && Date.now() - memory.at < 30000) return memory.value;
  if (pending) return pending;
  pending = (async () => {
    const result = await Promise.allSettled(
      collections.map((name) => list(name)),
    );
    const content: Content[] = [];
    let categories: Category[] = [];
    let sourceCount = 0;
    let unavailable = false;
    result.forEach((r, index) => {
      if (r.status === "rejected") {
        unavailable = true;
        return;
      }
      const kind = collections[index];
      if (kind === "categories") categories = r.value as Category[];
      else if (kind === "sources")
        sourceCount = r.value.filter((v) => "enabled" in v && v.enabled).length;
      else
        content.push(
          ...(r.value as Content[]).filter((item) => publicContent(item)),
        );
    });
    let jobs: ImportJob[] = [];
    try {
      jobs = (await list("jobs"))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .slice(0, 5);
    } catch {
      unavailable = true;
    }
    const value = { content, categories, jobs, sourceCount, unavailable };
    // Keep the last verified snapshot during a temporary database outage.
    if (unavailable && memory) return { ...memory.value, unavailable: true };
    memory = { at: Date.now(), value };
    return value;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}

export async function radarData(query: RadarQuery = {}): Promise<RadarData> {
  const s = await snapshot();
  const content = s.content.filter((item) => contentAvailableInLocale(item, query.lang || "en"));
  const now = Date.now();
  const counts = Object.fromEntries(
    ["news", "models", "companies", "tools", "events"].map((kind) => [
      kind,
      content.filter((item) => item.kind === kind).length,
    ]),
  );
  let items = content.filter((item) => {
    if (
      query.group === "startups" &&
      (item.kind !== "companies" || !item.startup)
    )
      return false;
    if (
      query.group === "picks" &&
      (item.kind !== "tools" || !item.buildersPick)
    )
      return false;
    if (query.kind && query.kind !== "all" && item.kind !== query.kind)
      return false;
    if (
      query.q &&
      !matchesQuery(
        item,
        query.q.slice(0, 200),
        s.categories
          .filter(
            (category) =>
              item.categories.includes(category.id) ||
              item.tags.includes(category.id),
          )
          .map((category) => category.title),
      )
    )
      return false;
    if (
      query.category &&
      !item.categories.includes(query.category) &&
      !item.tags.includes(query.category)
    )
      return false;
    if (
      query.company &&
      item.id !== query.company &&
      !item.companyIds.includes(query.company)
    )
      return false;
    if (query.since || query.until) {
      const timestamp =
        item.kind === "events" ? item.startsAt : item.publishedAt;
      const calendarDate = new Intl.DateTimeFormat("sv-SE", {
        timeZone: item.kind === "events" ? item.timezone : "Asia/Jerusalem",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(timestamp));
      if (query.since && calendarDate < query.since) return false;
      if (query.until && calendarDate > query.until) return false;
    }
    if (item.kind === "events") {
      if (
        query.eventState === "upcoming" &&
        !["upcoming", "ongoing"].includes(eventState(item, now))
      )
        return false;
      if (query.eventState === "past" && eventState(item, now) !== "past")
        return false;
      if (
        query.eventState === "cancelled" &&
        eventState(item, now) !== "cancelled"
      )
        return false;
      if (query.organizer && item.organizer !== query.organizer) return false;
      if (query.location && item.location.en !== query.location) return false;
      if (query.eventType && item.eventType !== query.eventType) return false;
    }
    return true;
  });
  if (["models", "developers", "startups"].includes(query.sort || ""))
    items = items.filter((item) => item.categories.includes(query.sort!));
  items.sort((a, b) => {
    if (query.sort === "important") {
      const score = (i: Content) =>
        i.kind === "news" ? i.importance : i.featured ? 100 : 0;
      return (
        score(b) - score(a) ||
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
      );
    }
    if (a.kind === "events" && b.kind === "events")
      return query.eventState === "past"
        ? Date.parse(b.startsAt) - Date.parse(a.startsAt)
        : Date.parse(a.startsAt) - Date.parse(b.startsAt);
    return (
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
      a.id.localeCompare(b.id)
    );
  });
  const total = items.length;
  const limit = Math.max(1, Math.min(24, query.limit || 9));
  const page = Math.max(1, Math.min(10000, query.page || 1));
  const latest = s.jobs[0];
  const lastRefresh =
    s.jobs.find((job) => ["success", "partial"].includes(job.status))
      ?.finishedAt || null;
  return {
    items: items.slice((page - 1) * limit, page * limit),
    total,
    page,
    hasMore: page * limit < total,
    counts,
    categories: s.categories,
    companies: s.content
      .filter((item) => item.kind === "companies")
      .map(({ id, title }) => ({ id, title })),
    organizers: [
      ...new Set(
        s.content
          .filter((item) => item.kind === "events")
          .map((item) => item.organizer),
      ),
    ],
    locations: [
      ...new Set(
        s.content
          .filter((item) => item.kind === "events")
          .map((item) => item.location.en),
      ),
    ],
    lastRefresh,
    sourceCount: s.sourceCount,
    sourceFailures:
      latest?.sources.filter(
        (source) => source.status === "failed" || source.error,
      ).length || 0,
    unavailable: s.unavailable,
  };
}

export async function featuredContent(locale: Locale = "en") {
  const s = await snapshot();
  const content = s.content.filter((item) => contentAvailableInLocale(item, locale));
  return {
    story: content
      .filter((item): item is News => item.kind === "news" && item.featured)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0],
    model: content
      .filter((item): item is Model => item.kind === "models")
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.releasedAt.localeCompare(a.releasedAt),
      )[0],
    event: content
      .filter(
        (item): item is RadarEvent =>
          item.kind === "events" &&
          ["upcoming", "ongoing"].includes(eventState(item)),
      )
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          a.startsAt.localeCompare(b.startsAt),
      )[0],
  };
}

export async function radarSitemapItems() {
  const s = await snapshot();
  return s.content.map((item) => ({
    kind: item.kind, id: item.id, updatedAt: item.updatedAt,
    locales: locales.filter((locale) => contentAvailableInLocale(item, locale)),
  }));
}

export function queryFromParams(params: URLSearchParams): RadarQuery {
  const result: RadarQuery = {};
  const lang = params.get("lang") || "";
  if (isLocale(lang)) result.lang = lang;
  for (const key of [
    "q",
    "kind",
    "category",
    "company",
    "sort",
    "eventState",
    "organizer",
    "location",
    "eventType",
    "group",
  ] as const)
    result[key] = (params.get(key) || "").slice(0, 200);
  for (const key of ["since", "until"] as const) {
    const value = params.get(key);
    if (
      value &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value))
    )
      result[key] = value;
  }
  for (const key of ["page", "limit"] as const) {
    const value = Number(params.get(key));
    if (Number.isFinite(value) && value > 0) result[key] = Math.floor(value);
  }
  return result;
}
