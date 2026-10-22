import { createHash, randomUUID } from "node:crypto";
import { applyReviewedHebrew } from "@/content/radar-translations";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { canonicalUrl, contentAvailableInLocale } from "./domain";
import { recordSchema, type ImportJob, type News, type Source } from "./schema";
import { get, list, put, withImportLock, newsByUrl } from "./store";
import { enrichDigest, enrichmentConfigured } from "./enrichment";

const maxBytes = 2_000_000;
export const articleId = (url: string) =>
  createHash("sha256").update(canonicalUrl(url)).digest("hex").slice(0, 40);
export const textOnly = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

// Restrict both requests and every redirect to the configured official hosts.
export async function fetchSource(url: string, source: Source, method = "GET") {
  let current = new URL(url).toString();
  for (let redirects = 0; redirects < 5; redirects++) {
    const target = new URL(current);
    if (
      target.protocol !== "https:" ||
      target.username ||
      target.password ||
      !source.allowedHosts.includes(target.hostname)
    )
      throw new Error("Unapproved source host");
    const response = await fetch(current, {
      method,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "FutureBuilders-AIRadar/1.0 (RSS reader)",
        Accept:
          method === "HEAD"
            ? "text/html"
            : "application/rss+xml,application/atom+xml,application/xml,text/xml",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect is missing a location");
      current = new URL(location, current).toString();
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`Source returned HTTP ${response.status}`);
    }
    return { response, url: current };
  }
  throw new Error("Too many redirects");
}

export async function boundedText(response: Response) {
  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel();
    throw new Error("Feed is too large");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty feed");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) throw new Error("Feed is too large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).toString("utf8");
}

export type FeedItem = {
  title: string;
  url: string;
  publishedAt: string;
  excerpt?: string;
};
export function parseFeed(xml: string, now = Date.now()): FeedItem[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true)
    throw new Error("Invalid or unsafe XML");
  const document = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
  }).parse(xml);
  const entries = document.rss?.channel?.item ?? document.feed?.entry;
  if (!entries) throw new Error("Unsupported RSS/Atom document");
  return (Array.isArray(entries) ? entries : [entries])
    .slice(0, 100)
    .flatMap((entry): FeedItem[] => {
      const title = textOnly(entry.title?.["#text"] ?? entry.title).slice(
        0,
        600,
      );
      const links: (string | Record<string, string> | undefined)[] =
        Array.isArray(entry.link) ? entry.link : [entry.link];
      const link = links.find(
        (v) =>
          typeof v === "string" || !v?.["@_rel"] || v["@_rel"] === "alternate",
      );
      const url = typeof link === "string" ? link : link?.["@_href"];
      const timestamp = Date.parse(
        entry.pubDate ?? entry.published ?? entry.updated,
      );
      // Undated and future-dated entries never receive an invented publication date.
      if (!title || !url || !Number.isFinite(timestamp) || timestamp > now)
        return [];
      try {
        return [
          {
            title,
            url: canonicalUrl(url),
            publishedAt: new Date(timestamp).toISOString(),
            excerpt: textOnly(
              entry.description ?? entry.summary?.["#text"] ?? entry.summary,
            ).slice(0, 1500),
          },
        ];
      } catch {
        return [];
      }
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 12);
}

export function classify(title: string) {
  if (/acquir|funding|invest|raises|startup|merger/i.test(title))
    return "startups";
  if (/security|safety|regulat|cyber|fairness|responsib/i.test(title))
    return "safety";
  if (/introduc|launch|release|welcome|new model/i.test(title)) return "models";
  if (/agent|automat/i.test(title)) return "agents";
  if (/code|coding|developer|pytorch|tpu|trainium|sdk|api/i.test(title))
    return "developers";
  return "research";
}

const angles: Record<string, { en: string; he: string }> = {
  models: {
    en: "Check the release notes, access requirements and limitations before choosing a model for your next project.",
    he: "כדאי לבדוק את פרטי ההשקה, תנאי הגישה והמגבלות לפני בחירת מודל לפרויקט הבא.",
  },
  startups: {
    en: "Follow changes in the AI ecosystem to identify new products, teams and collaboration opportunities.",
    he: "שינויים באקוסיסטם ה־AI עוזרים להכיר מוצרים, צוותים והזדמנויות לשיתוף פעולה.",
  },
  safety: {
    en: "Security and evaluation methods can help you assess risks before integrating AI into a product.",
    he: "שיטות אבטחה והערכה יכולות לעזור לזהות סיכונים לפני שילוב AI במוצר.",
  },
  agents: {
    en: "Use the original technical details to explore automation ideas, then test reliability on your own tasks.",
    he: "אפשר לבחון רעיונות לאוטומציה על בסיס הפרטים במקור, ואז לבדוק אמינות במשימות שלכם.",
  },
  developers: {
    en: "Look for technical guidance you can validate in a small development experiment.",
    he: "חפשו במקור הנחיות טכניות שאפשר לבדוק בניסוי פיתוח קטן.",
  },
  research: {
    en: "Read the methods and limitations before applying research findings in a real product.",
    he: "מומלץ לקרוא את השיטות והמגבלות לפני יישום ממצאי מחקר במוצר אמיתי.",
  },
};

export function makeDigest(item: FeedItem, source: Source, now: string): News {
  const category = classify(item.title);
  const companyIds = new Set(source.companyId ? [source.companyId] : []);
  for (const [pattern, id] of [
    [/\bopenai\b/i, "openai"],
    [/\banthropic\b|\bclaude\b/i, "anthropic"],
    [/\bgoogle\b|\bdeepmind\b|\bgemini\b/i, "google"],
    [/\bmeta\b/i, "meta"],
    [/\bmistral\b/i, "mistral"],
    [/\bxai\b|\bgrok\b/i, "xai"],
    [/\bdeepseek\b/i, "deepseek"],
    [/\balibaba\b|\bqwen\b/i, "qwen"],
    [/\bqodo\b/i, "qodo"],
  ] as const)
    if (pattern.test(item.title)) companyIds.add(id);
  // Preserve source wording unless a reviewed translation is available. Hebrew
  // listings omit untranslated news; the English source update remains usable.
  return applyReviewedHebrew(recordSchema.parse({
    id: articleId(item.url),
    kind: "news",
    title: { en: item.title, he: item.title },
    summary: {
      en: `${source.title.en} published this update. Follow the source for the full announcement, technical details and limitations.`,
      he: `${source.title.he} פרסמה את העדכון הזה. הפרטים המלאים, ההקשר הטכני והמגבלות זמינים במקור.`,
    },
    why: angles[category],
    importance: category === "models" ? 60 : 30,
    importanceReason: {
      en:
        category === "models"
          ? "Release-related headline from a connected source; not a model ranking."
          : "Standard source update; no popularity score is used.",
      he:
        category === "models"
          ? "כותרת העוסקת בהשקה ממקור מחובר; זה אינו דירוג מודלים."
          : "עדכון רגיל ממקור מחובר; ללא מדד פופולריות.",
    },
    sourceUrl: item.url,
    sourceName: source.title.en,
    publishedAt: item.publishedAt,
    discoveredAt: now,
    updatedAt: now,
    verifiedAt: now,
    categories: [category],
    tags: [source.title.en],
    companyIds: [...companyIds],
    status: source.autoPublish ? "published" : "review",
    featured: false,
    originalTitle: item.title,
    languageMode: "source-digest",
  }) as News);
}

export async function importRadar() {
  const id = randomUUID();
  return withImportLock(id, async () => {
    // Recover history of interrupted jobs without relabelling failed runs success.
    for (const old of await list("jobs")) {
      if (
        old.status === "running" &&
        Date.now() - Date.parse(old.startedAt) > 600000
      )
        await put("jobs", {
          ...old,
          status: "failed",
          finishedAt: new Date().toISOString(),
        });
    }
    const job: ImportJob = {
      id,
      startedAt: new Date().toISOString(),
      finishedAt: "",
      status: "running",
      inserted: 0,
      duplicates: 0,
      rejected: 0,
      sources: [],
    };
    await put("jobs", job);
    try {
      const sources = (await list("sources")).filter(
        (source) => source.enabled,
      );
      if (!sources.length)
        throw new Error("No enabled sources. Run radar:seed first.");
      // Sources are independent; keep one unavailable publisher from blocking others.
      job.sources = await Promise.all(
        sources.map(async (source) => {
          let inserted = 0;
          let enriched = 0;
          const issues: string[] = [];
          try {
            const { response } = await fetchSource(source.url, source);
            const items = parseFeed(await boundedText(response));
            for (const item of items) {
              if (await get("news", articleId(item.url))) {
                job.duplicates++;
                continue;
              }
              try {
                const checked = await fetchSource(item.url, source, "HEAD");
                await checked.response.body?.cancel();
                if (await newsByUrl(canonicalUrl(checked.url))) {
                  job.duplicates++;
                  continue;
                }
                let article = makeDigest(
                  { ...item, url: canonicalUrl(checked.url) },
                  source,
                  new Date().toISOString(),
                );
                // Bound optional inference work to keep cron duration predictable.
                // A failed inference call leaves a clearly labelled source digest.
                if (enrichmentConfigured() && enriched < 2) {
                  enriched++;
                  try {
                    article = await enrichDigest(article, item.excerpt || "");
                  } catch {
                    issues.push(
                      "Bilingual draft generation unavailable; source digest retained.",
                    );
                  }
                }
                // Persist review first: a failed content save leaves an actionable
                // pending review, never published unreviewed community content.
                if (article.status === "review" || !contentAvailableInLocale(article, "he"))
                  await put("reviews", {
                    id: article.id,
                    contentId: article.id,
                    kind: "news",
                    status: "pending",
                    reason: !contentAvailableInLocale(article, "he")
                      ? "Hebrew translation required: this update is available only in English until its Hebrew headline and summary are reviewed."
                      : "Review source claims and bilingual copy before publishing.",
                    updatedAt: article.updatedAt,
                  });
                if (await put("news", article, true)) {
                  inserted++;
                  job.inserted++;
                } else job.duplicates++;
              } catch (error) {
                job.rejected++;
                issues.push(
                  error instanceof Error
                    ? error.message
                    : "Item validation failed",
                );
              }
            }
            return {
              id: source.id,
              status: "success" as const,
              inserted,
              ...(issues.length
                ? { error: [...new Set(issues)].join(" ") }
                : {}),
            };
          } catch (error) {
            return {
              id: source.id,
              status: "failed" as const,
              inserted,
              error:
                error instanceof Error ? error.message : "Source unavailable",
            };
          }
        }),
      );
      const failures = job.sources.filter((s) => s.status === "failed").length;
      job.status =
        failures === sources.length
          ? "failed"
          : failures || job.rejected
            ? "partial"
            : "success";
    } catch (error) {
      job.status = "failed";
      job.sources.push({
        id: "pipeline",
        status: "failed",
        inserted: 0,
        error: error instanceof Error ? error.message : "Import failed",
      });
    } finally {
      job.finishedAt = new Date().toISOString();
      await put("jobs", job);
    }
    return job;
  });
}
