import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import {
  eventState,
  canonicalUrl,
  matchesQuery,
  publicContent,
  jsonLd,
  contentAvailableInLocale,
  displayDate,
} from "../src/lib/radar/domain";
import {
  parseFeed,
  makeDigest,
  articleId,
  importRadar,
  fetchSource,
} from "../src/lib/radar/importer";
import { seedRecords, seedRadar } from "../src/lib/radar/seed";
import {
  recordSchema,
  type Source,
  type RadarEvent,
} from "../src/lib/radar/schema";
import { list, put, get } from "../src/lib/radar/store";
import { enrichDigest } from "../src/lib/radar/enrichment";
import { applyReviewedHebrew, reviewedHebrewNews } from "../src/content/radar-translations";
import { radarArtwork } from "../src/lib/radar/presentation";

const subdir = `radar-test-${randomUUID()}`;
const originalFetch = globalThis.fetch;
const source = seedRecords().find(
  (r) => r.kind === "sources" && r.id === "openai-rss",
) as Source;
const event = seedRecords().find((r) => r.kind === "events") as RadarEvent;
before(() => {
  Object.assign(process.env, {
    NODE_ENV: "test",
    RADAR_STORAGE: "local",
    RADAR_DATA_SUBDIR: subdir,
  });
});
after(async () => {
  globalThis.fetch = originalFetch;
  await rm(path.join(process.cwd(), ".data", subdir), {
    recursive: true,
    force: true,
  });
});

test("event boundaries, offsets, cancellation and draft status", () => {
  assert.equal(
    eventState(event, Date.parse("2026-10-21T04:59:59Z")),
    "upcoming",
  );
  assert.equal(
    eventState(event, Date.parse("2026-10-21T05:00:00Z")),
    "ongoing",
  );
  assert.equal(eventState(event, Date.parse("2026-10-21T13:00:00Z")), "past");
  assert.equal(
    eventState({ ...event, eventStatus: "cancelled" }, 0),
    "cancelled",
  );
  assert.equal(
    eventState({ ...event, eventStatus: "draft" }, Date.now()),
    "draft",
  );
});
test("dates use stable month labels across Safari and Node and retain event time zones", () => {
  assert.equal(displayDate("2026-09-29T10:00:00Z", "en"), "29 Sep 2026");
  assert.equal(displayDate("2026-10-21T22:00:00Z", "he", "Asia/Jerusalem", true), "22 באוק׳ 2026, 01:00");
  assert.equal(displayDate("2026-10-21T22:00:00Z", "en", "UTC", true), "21 Oct 2026, 22:00");
  assert.equal(displayDate("invalid", "he"), "—");
});
test("stable URL identity removes only tracking, retains meaningful query parameters", () => {
  assert.equal(
    canonicalUrl("https://openai.com/index/item/?utm_source=x&b=2&a=1#test"),
    "https://openai.com/index/item?a=1&b=2",
  );
  assert.equal(
    articleId("https://openai.com/index/item/"),
    articleId("https://openai.com/index/item?utm_campaign=x"),
  );
  assert.throws(() => canonicalUrl("javascript:alert(1)"));
  assert.throws(() => canonicalUrl("https://user:secret@openai.com"));
});
test("all starter records are schema-valid and recommendations remain manual", () => {
  const records = seedRecords();
  assert.ok(records.length > 50);
  for (const record of records)
    assert.ok(recordSchema.safeParse(record).success);
  assert.ok(
    records.filter((r) => r.kind === "tools").every((r) => !r.buildersPick),
  );
});
test("bad URLs fail validation without throwing; publication and image rules are enforced", () => {
  assert.equal(
    recordSchema.safeParse({ ...event, sourceUrl: "javascript:alert(1)" })
      .success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ ...event, verifiedAt: "" }).success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ ...event, endsAt: event.startsAt }).success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ ...event, benefitApproved: false }).success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ ...event, image: "/events/../secrets.png" })
      .success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ ...event, imageCredit: "" }).success,
    false,
  );
  assert.equal(
    recordSchema.safeParse({ ...event, timezone: "Invalid/Zone" }).success,
    false,
  );
});
test("Hebrew and English search, publication privacy and script escaping", () => {
  assert.ok(matchesQuery(event, "נטוורקינג"));
  assert.ok(matchesQuery(event, "Lynx"));
  assert.equal(publicContent({ ...event, status: "hidden" }), false);
  assert.equal(publicContent({ ...event, eventStatus: "draft" }), false);
  assert.equal(
    publicContent({ ...event, publishedAt: "2999-01-01T00:00:00Z" }),
    false,
  );
  assert.equal(
    jsonLd({ title: "</script><script>bad</script>" }).includes("<"),
    false,
  );
});
test("RSS and Atom preserve dates and safely reject unsafe, undated and future entries", () => {
  const rss = `<rss><channel><item><title>Research &amp; code</title><link>https://openai.com/index/test</link><pubDate>Tue, 20 Oct 2026 10:00:00 GMT</pubDate></item><item><title>No date</title><link>https://openai.com/no-date</link></item><item><title>Future</title><link>https://openai.com/future</link><pubDate>2099-01-01</pubDate></item></channel></rss>`;
  const items = parseFeed(rss, Date.parse("2026-10-20T12:00:00Z"));
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Research & code");
  assert.equal(items[0].publishedAt, "2026-10-20T10:00:00.000Z");
  const atom =
    '<feed><entry><title>Model release</title><link rel="self" href="https://openai.com/self"/><link rel="alternate" href="https://openai.com/real"/><published>2026-10-19T08:00:00Z</published></entry></feed>';
  assert.equal(parseFeed(atom)[0].url, "https://openai.com/real");
  assert.throws(() =>
    parseFeed('<!DOCTYPE foo [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>'),
  );
  assert.throws(() => parseFeed("<not-xml"));
});
test("a source digest preserves its headline and never invents a translation or recommendation", () => {
  const digest = makeDigest(
    {
      title: "A real model release",
      url: "https://openai.com/test",
      publishedAt: "2026-10-20T10:00:00Z",
    },
    source,
    "2026-10-20T12:00:00Z",
  );
  assert.equal(digest.title.en, digest.title.he);
  assert.equal(digest.languageMode, "source-digest");
  assert.equal(digest.discoveredAt, "2026-10-20T12:00:00Z");
  assert.equal(digest.publishedAt, "2026-10-20T10:00:00Z");
  assert.equal(digest.featured, false);
  assert.equal(
    makeDigest(
      {
        title: "Community post",
        url: "https://huggingface.co/blog/test",
        publishedAt: digest.publishedAt,
      },
      { ...source, autoPublish: false },
      digest.updatedAt,
    ).status,
    "review",
  );
});
test("source requests reject private hosts and unapproved redirect destinations", async () => {
  await assert.rejects(() => fetchSource("https://127.0.0.1/private", source));
  globalThis.fetch = async () =>
    new Response(null, {
      status: 302,
      headers: { location: "https://attacker.example/" },
    });
  await assert.rejects(() => fetchSource(source.url, source), /Unapproved/);
  globalThis.fetch = originalFetch;
});

test("reviewed news translations preserve sources and existing editorial Hebrew", () => {
  for (const [title, translation] of reviewedHebrewNews) {
    const raw = makeDigest({ title, url: "https://openai.com/test", publishedAt: "2026-10-20T10:00:00Z" }, source, "2026-10-20T12:00:00Z");
    assert.equal(raw.title.he, translation.title);
    assert.equal(raw.summary.he, translation.summary);
    assert.equal(raw.title.en, title);
    assert.equal(raw.originalTitle, title);
    assert.ok(contentAvailableInLocale(raw, "he"));
    assert.ok(recordSchema.safeParse(raw).success);
    assert.equal(applyReviewedHebrew(raw), raw);
  }
  const raw = makeDigest({ title: "Untranslated future update", url: "https://openai.com/test", publishedAt: "2026-10-20T10:00:00Z" }, source, "2026-10-20T12:00:00Z");
  assert.ok(contentAvailableInLocale(raw, "en"));
  assert.equal(contentAvailableInLocale(raw, "he"), false);
  assert.equal(contentAvailableInLocale({ ...raw, title: { ...raw.title, he: "כותרת בעברית" }, summary: { ...raw.summary, he: "English only" } }, "he"), false);
});

test("provided images match subjects and the favourite builders cover remains in use", () => {
  const raw = makeDigest({ title: "Southeast Asia’s digital economy to hit $368 billion", url: "https://openai.com/test", publishedAt: "2026-10-20T10:00:00Z" }, source, "2026-10-20T12:00:00Z");
  assert.equal(radarArtwork(raw).image, "/radar/selected/connected-asia.webp");
  assert.equal(radarArtwork({ ...raw, image: "/radar/custom.webp" }).image, "/radar/custom.webp");
  const coding = seedRecords().find(r => r.kind === "news" && r.title.en.includes("AI coding"));
  assert.ok(coding && coding.kind === "news");
  assert.equal(radarArtwork(coding).image, "/radar/editorial/builders.webp");
});
test("publisher trailing-slash redirects are followed without a normalization loop", async () => {
  let requests = 0;
  globalThis.fetch = async (input) => {
    requests++;
    return String(input).endsWith("/")
      ? new Response("ok")
      : new Response(null, {
          status: 301,
          headers: { location: `${String(input)}/` },
        });
  };
  const result = await fetchSource("https://openai.com/index/test", source);
  assert.ok(result.url.endsWith("/"));
  assert.equal(requests, 2);
  globalThis.fetch = originalFetch;
});
test("imports are idempotent, keep editorial edits, log failures and serialize concurrent runs", async () => {
  await seedRadar();
  assert.equal((await seedRadar()).inserted, 0);
  for (const row of await list("sources"))
    await put("sources", { ...row, enabled: row.id === "openai-rss" });
  globalThis.fetch = async (input, init) => {
    if (init?.method === "HEAD") return new Response(null, { status: 200 });
    return new Response(
      "<rss><channel><item><title>Introducing test model</title><link>https://openai.com/index/unique-test-model</link><pubDate>Tue, 20 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>",
    );
  };
  const [first, second] = await Promise.all([importRadar(), importRadar()]);
  assert.equal((first?.inserted || 0) + (second?.inserted || 0), 1);
  assert.equal((first?.duplicates || 0) + (second?.duplicates || 0), 1);
  const id = articleId("https://openai.com/index/unique-test-model");
  const record = await get("news", id);
  assert.ok(record);
  assert.match((await get("reviews", id))?.reason || "", /Hebrew translation required/);
  await put("news", {
    ...record,
    status: "hidden",
    title: { en: "Editor's title", he: "כותרת ערוכה" },
  });
  await importRadar();
  assert.equal((await get("news", id))?.title.en, "Editor's title");
  assert.equal((await get("news", id))?.status, "hidden");
  globalThis.fetch = async () => new Response(null, { status: 503 });
  const failed = await importRadar();
  assert.equal(failed?.status, "failed");
  assert.ok((await list("news")).length > 0);
  assert.equal((await list("jobs")).length, 4);
  globalThis.fetch = originalFetch;
});

test("optional self-hosted bilingual generation is validated and always requires editorial review", async () => {
  const article = makeDigest(
    {
      title: "A model update",
      url: "https://openai.com/test",
      publishedAt: "2026-10-20T10:00:00Z",
    },
    source,
    "2026-10-20T12:00:00Z",
  );
  process.env.RADAR_OLLAMA_URL = "http://127.0.0.1:11434";
  process.env.RADAR_OLLAMA_MODEL = "test-only";
  const draft = {
    title: { en: "A model update", he: "עדכון מודל" },
    summary: {
      en: "The source published an update. Details are in the announcement.",
      he: "המקור פרסם עדכון. הפרטים מופיעים בהכרזה.",
    },
    why: {
      en: "Try it on your own tasks.",
      he: "אפשר לבדוק אותו במשימות שלכם.",
    },
  };
  try {
    globalThis.fetch = async (_input, init) => {
      const sent = JSON.parse(String(init?.body));
      assert.equal(sent.stream, false);
      assert.equal(sent.options.temperature, 0);
      return Response.json({ response: JSON.stringify(draft) });
    };
    const generated = await enrichDigest(article, "Source RSS description");
    assert.equal(generated.status, "review");
    assert.equal(generated.title.he, "עדכון מודל");
    assert.equal(generated.sourceUrl, article.sourceUrl);
    assert.equal(generated.publishedAt, article.publishedAt);
    globalThis.fetch = async () => Response.json({ response: "invalid JSON" });
    await assert.rejects(() => enrichDigest(article, "Source RSS description"));
  } finally {
    delete process.env.RADAR_OLLAMA_URL;
    delete process.env.RADAR_OLLAMA_MODEL;
    globalThis.fetch = originalFetch;
  }
});
