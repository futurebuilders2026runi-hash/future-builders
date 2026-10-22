import type { Content, RadarEvent } from "./schema";
import type { Locale } from "../../content/config";

export function displayDate(
  value: string,
  locale: Locale,
  timezone = "Asia/Jerusalem",
  time = false,
) {
  if (!value || !Number.isFinite(Date.parse(value))) return "—";
  // Safari and Node's ICU disagree on abbreviations such as Sep/Sept. Extract
  // calendar parts in the requested zone and use fixed labels for stable SSR.
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "numeric", year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" as const } : {}),
    timeZone: timezone,
  }).formatToParts(new Date(value));
  const read = (part: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === part)?.value || "";
  const months = locale === "he"
    ? ["בינו׳", "בפבר׳", "במרץ", "באפר׳", "במאי", "ביוני", "ביולי", "באוג׳", "בספט׳", "באוק׳", "בנוב׳", "בדצמ׳"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = `${read("day")} ${months[Number(read("month")) - 1]} ${read("year")}`;
  return time ? `${date}, ${read("hour")}:${read("minute")}` : date;
}

export function eventState(
  event: Pick<RadarEvent, "eventStatus" | "startsAt" | "endsAt">,
  now = Date.now(),
) {
  if (event.eventStatus === "cancelled") return "cancelled";
  if (event.eventStatus === "draft") return "draft";
  if (now >= Date.parse(event.endsAt)) return "past";
  if (now >= Date.parse(event.startsAt)) return "ongoing";
  return "upcoming";
}

export function canonicalUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Unsafe URL");
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

export function searchText(value: unknown): string {
  if (typeof value === "string")
    return value
      .normalize("NFKD")
      .replace(/[\u0591-\u05c7]/g, "")
      .toLocaleLowerCase();
  if (Array.isArray(value)) return value.map(searchText).join(" ");
  if (value && typeof value === "object")
    return Object.values(value).map(searchText).join(" ");
  return "";
}

export function matchesQuery(
  item: Content,
  query: string,
  extra: unknown = [],
) {
  let haystack = searchText([item, extra]);
  for (const [english, hebrew] of [
    ["anthropic", "אנתרופיק"],
    ["openai", "אופן איי"],
    ["google", "גוגל"],
    ["mistral", "מיסטרל"],
    ["deepseek", "דיפסיק"],
    ["networking", "נטוורקינג"],
  ])
    if (haystack.includes(english)) haystack += ` ${hebrew}`;
  return searchText(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function publicContent(item: Content, now = Date.now()) {
  return (
    item.status === "published" &&
    Date.parse(item.publishedAt) <= now &&
    (item.kind !== "events" ||
      (Boolean(item.verifiedAt) && item.eventStatus !== "draft"))
  );
}

/** Imported headlines stay on the English site until Hebrew prose is ready.
 * Product and company names may retain their original spelling.
 */
export function contentAvailableInLocale(item: Content, locale: Locale) {
  return locale !== "he" || item.kind !== "news" ||
    [item.title.he, item.summary.he, item.why.he].every((text) => /[א-ת]/.test(text));
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
