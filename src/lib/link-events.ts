import "server-only";

import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { locales } from "@/content/config";

/** Pages whose opens are counted. Anything else posted to /api/track is rejected. */
export const trackedSlugs = ["future-of-ai"] as const;
export type TrackedSlug = (typeof trackedSlugs)[number];

const eventTypes = ["view", "register_click"] as const;
type EventType = (typeof eventTypes)[number];

export type LinkEvent = {
  slug: TrackedSlug;
  event: EventType;
  lang: string | null;
  source: string | null;
  visitor_id: string | null;
  created_at: string;
};

const VISITOR_ID = /^[a-z0-9-]{8,64}$/i;

/** Validates a client beacon. Returns null for anything malformed. */
export function parseLinkEvent(body: unknown): Omit<LinkEvent, "created_at"> | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (!trackedSlugs.includes(b.slug as TrackedSlug)) return null;
  if (!eventTypes.includes(b.event as EventType)) return null;
  const lang = locales.includes(b.lang as (typeof locales)[number]) ? (b.lang as string) : null;
  const source =
    typeof b.source === "string" && b.source.trim()
      ? b.source.trim().toLowerCase().slice(0, 60)
      : null;
  const visitor = typeof b.visitor === "string" && VISITOR_ID.test(b.visitor) ? b.visitor : null;
  return { slug: b.slug as TrackedSlug, event: b.event as EventType, lang, source, visitor_id: visitor };
}

function storageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const headers: Record<string, string> = { apikey: key };
    if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
    return { endpoint: `${url.replace(/\/$/, "")}/rest/v1/link_events`, headers };
  }
  if (url || key || process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("Link event storage is not configured");
  }
  return null;
}

const localFile = () => path.join(process.cwd(), ".data", "link-events.jsonl");

export async function recordLinkEvent(event: Omit<LinkEvent, "created_at">): Promise<void> {
  const record: LinkEvent = { ...event, created_at: new Date().toISOString() };
  const config = storageConfig();
  if (config) {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { ...config.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Link event insert failed (${response.status})`);
    return;
  }
  await mkdir(path.dirname(localFile()), { recursive: true, mode: 0o700 });
  await appendFile(localFile(), `${JSON.stringify(record)}\n`, { mode: 0o600 });
}

async function listLinkEvents(slug: TrackedSlug): Promise<LinkEvent[]> {
  const config = storageConfig();
  if (config) {
    const events: LinkEvent[] = [];
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const params = new URLSearchParams({
        select: "slug,event,lang,source,visitor_id,created_at",
        slug: `eq.${slug}`,
        order: "created_at.desc",
        limit: String(pageSize),
        offset: String(offset),
      });
      const response = await fetch(`${config.endpoint}?${params}`, {
        headers: config.headers,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Link event list failed (${response.status})`);
      const page: LinkEvent[] = await response.json();
      events.push(...page);
      if (page.length < pageSize) return events;
    }
  }

  let contents: string;
  try {
    contents = await readFile(localFile(), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return contents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as LinkEvent)
    .filter((e) => e.slug === slug);
}

export type LinkStats = {
  opens: number;
  uniqueVisitors: number;
  registerClicks: number;
  today: number;
  last: string | null;
  /** Opens per day (Israel time), oldest first, covering the last 14 days. */
  daily: { day: string; opens: number }[];
  /** Opens grouped by ?src= / utm_source / referrer, most first. */
  sources: { source: string; opens: number }[];
  byLang: { lang: string; opens: number }[];
};

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" });

export async function getLinkStats(slug: TrackedSlug): Promise<LinkStats> {
  const events = await listLinkEvents(slug);
  const views = events.filter((e) => e.event === "view");

  const count = (keyOf: (e: LinkEvent) => string) => {
    const map = new Map<string, number>();
    for (const e of views) map.set(keyOf(e), (map.get(keyOf(e)) ?? 0) + 1);
    return [...map].sort((a, b) => b[1] - a[1]);
  };

  const now = Date.now();
  const daily = Array.from({ length: 14 }, (_, i) => dayKey.format(now - (13 - i) * 86_400_000));
  const perDay = new Map(count((e) => dayKey.format(new Date(e.created_at))));
  const todayKey = dayKey.format(now);

  return {
    opens: views.length,
    uniqueVisitors: new Set(views.map((e) => e.visitor_id).filter(Boolean)).size,
    registerClicks: events.filter((e) => e.event === "register_click").length,
    today: perDay.get(todayKey) ?? 0,
    last: views.reduce<string | null>((max, e) => (!max || e.created_at > max ? e.created_at : max), null),
    daily: daily.map((day) => ({ day, opens: perDay.get(day) ?? 0 })),
    sources: count((e) => e.source || "direct").map(([source, opens]) => ({ source, opens })),
    byLang: count((e) => e.lang || "—").map(([lang, opens]) => ({ lang, opens })),
  };
}
