import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("Hebrew news and partner resources follow the route language", async ({ page }) => {
  await page.goto("/he/ai-radar?lang=en");
  const titles = page.locator(".radar-card-news .radar-card-title");
  await expect(titles.first()).toBeVisible();
  for (const title of await titles.all()) expect(await title.innerText()).toMatch(/[א-ת]/);
  const headline = await titles.first().innerText();
  await titles.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/he\/ai-radar\/news\//);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(headline);
  await page.goto("/he/ai-radar");
  const partner = page.locator(".partner-resource");
  await expect(partner.getByRole("heading", { name: "ראובן לרנר" })).toBeVisible();
  await expect(partner).toContainText("בכל יום שני, באנגלית");
  await expect(partner.getByRole("link")).toHaveAttribute("href", "https://lernerpython.com/become-a-better-developer/");
  await page.goto("/he#partners");
  await expect(page.locator("#partners .partner-resource")).toContainText("ראובן לרנר");
  await page.goto("/en/ai-radar");
  await expect(page.locator(".partner-resource")).toContainText("Reuven Lerner");
});

test("untranslated imports stay off Hebrew listings and detail pages until translated", async ({ request }) => {
  const headers = { Origin: "http://localhost:3101" };
  expect((await request.post("/api/admin/login", { headers, data: { password: "radar-browser-test-password" } })).status()).toBe(200);
  const original = (await (await request.get("/api/radar?kind=news&lang=en")).json()).items[0];
  const record = { ...original, id: "locale-integration-test", sourceUrl: "https://openai.com/index/locale-integration-test", title: { en: "Untranslated locale integration news", he: "Untranslated locale integration news" }, originalTitle: "Untranslated locale integration news", featured: false, languageMode: "source-digest" };
  const save = async (news: typeof record) => expect((await request.post("/api/admin/radar", { headers, data: { action: "save", record: news } })).status()).toBe(200);
  const results = async (lang: string) => (await (await request.get(`/api/radar?kind=news&q=locale%20integration&lang=${lang}`)).json()).items;
  await save(record);
  try {
    expect(await results("en")).toHaveLength(1);
    expect(await results("he")).toHaveLength(0);
    // Next can stream its not-found UI with HTTP 200 once a layout has flushed.
    const missing = await (await request.get("/he/ai-radar/news/locale-integration-test")).text();
    expect(missing).toMatch(/<meta name="robots" content="noindex"/);
    expect(missing).not.toContain(record.title.en);
    expect((await request.get("/en/ai-radar/news/locale-integration-test")).status()).toBe(200);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/he/ai-radar/news/locale-integration-test");
    expect(sitemap).toContain("/en/ai-radar/news/locale-integration-test");
    await save({ ...record, title: { ...record.title, he: "חדשות לבדיקת תרגום" }, languageMode: "edited" });
    expect(await results("he")).toHaveLength(1);
    const detail = await request.get("/he/ai-radar/news/locale-integration-test");
    expect(detail.status()).toBe(200);
    expect(await detail.text()).toContain("חדשות לבדיקת תרגום");
  } finally {
    await save({ ...record, status: "hidden" });
  }
});

test("editorial covers load on mobile and the priority and filter controls work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/ai-radar");
  await expect(page.locator(".radar-lead-story")).toBeVisible();
  const cards = page.locator(".radar-story-grid article");
  await expect(cards.first()).toBeVisible();
  const covers = cards.locator("img");
  await expect(covers).toHaveCount(await cards.count());
  for (const cover of await covers.all()) {
    await cover.scrollIntoViewIfNeeded();
    await expect.poll(() => cover.evaluate((node) => {
      const image = node as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    })).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Worth your attention", exact: true }).click();
  await expect(page).toHaveURL(/sort=important/);
  await expect(page.getByRole("button", { name: "Worth your attention", exact: true })).toHaveAttribute("aria-pressed", "true");
  const filters = page.locator(".radar-filter-drawer");
  await expect(filters).not.toHaveAttribute("open");
  await filters.locator("summary").click();
  await expect(filters.getByRole("combobox", { name: "All topics", exact: true })).toBeVisible();
});

test("a saved empty page refreshes immediately when Safari restores it", async ({
  page,
  request,
}) => {
  const populated = await (await request.get("/api/radar?kind=news")).json();
  expect(populated.items.length).toBeGreaterThan(0);
  let showEmpty = true;
  let refreshRequests = 0;
  await page.route("**/api/radar?**", (route) => {
    refreshRequests++;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        showEmpty ? { ...populated, items: [], total: 0, hasMore: false } : populated,
      ),
    });
  });
  await page.goto("/en/ai-radar");
  // A new page must check for content even if the server snapshot is stale.
  await expect.poll(() => refreshRequests).toBeGreaterThan(0);
  await expect(page.locator("#radar-content article")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Nothing on the radar yet." }),
  ).toBeVisible();

  showEmpty = false;
  const beforeRestore = refreshRequests;
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
  });
  await expect.poll(() => refreshRequests).toBeGreaterThan(beforeRestore);
  await expect(page.locator("#radar-content article")).toHaveCount(
    populated.items.length,
  );
});

test("authorized image uploads are re-encoded and served safely; unsafe formats are rejected", async ({
  request,
}) => {
  const origin = { Origin: "http://localhost:3101" };
  const login = await request.post("/api/admin/login", {
    headers: origin,
    data: { password: "radar-browser-test-password" },
  });
  expect(login.status()).toBe(200);
  const upload = await request.post("/api/admin/radar/media", {
    headers: origin,
    multipart: {
      rightsConfirmed: "true",
      file: {
        name: "club.png",
        mimeType: "image/png",
        buffer: await readFile("public/og.png"),
      },
    },
  });
  expect(upload.status()).toBe(200);
  const { image } = await upload.json();
  expect(image).toMatch(/^\/api\/radar\/media\/[a-f0-9-]+\.webp$/);
  const publicImage = await request.get(image);
  expect(publicImage.status()).toBe(200);
  expect(publicImage.headers()["content-type"]).toBe("image/webp");
  expect(publicImage.headers()["x-content-type-options"]).toBe("nosniff");
  const unsafe = await request.post("/api/admin/radar/media", {
    headers: origin,
    multipart: {
      rightsConfirmed: "true",
      file: {
        name: "unsafe.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        ),
      },
    },
  });
  expect(unsafe.status()).toBe(400);
});

test("Hebrew and English pages, responsive navigation and model comparison", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/en/ai-radar");
  await expect(page.getByRole("heading", { name: "AI RADAR." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("button", { name: /Model Watch/ }).click();
  const buttons = page.getByRole("button", { name: "Add to comparison" });
  await expect(buttons).toHaveCount(4);
  await buttons.nth(0).click();
  await buttons.nth(0).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("table").locator("thead th")).toHaveCount(3);
  await page.getByRole("button", { name: "Clear comparison" }).click();
  await page.getByRole("searchbox").fill("Anthropic");
  await expect(page.locator("#radar-content article")).toHaveCount(2);
  await page.getByRole("searchbox").fill("איןתוצאהכזאת");
  await expect(
    page.getByRole("heading", { name: "Nothing on the radar yet." }),
  ).toBeVisible();
  await page.route("**/api/radar?**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "temporarily_unavailable" }),
    }),
  );
  await page.getByRole("searchbox").fill("test-source-outage");
  await expect(page.locator("#radar-content").getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByRole("heading", { name: "AI RADAR." })).toBeVisible();
  await page.unroute("**/api/radar?**");
  await page.goto("/he/ai-radar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "תפריט", exact: true }).click();
  await expect(
    page
      .locator("#mobile-nav")
      .getByRole("link", { name: "AI Radar", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "סגירה", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".data/radar-qa/he-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/en/ai-radar");
  await page.screenshot({
    path: ".data/radar-qa/en-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("public APIs do not expose drafts, admin writes require session and origin, and cron requires a secret", async ({
  request,
}) => {
  expect((await request.get("/api/admin/radar")).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin/radar", {
        headers: { Origin: "http://localhost:3101" },
        data: { action: "seed" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/admin/radar", {
        headers: { Origin: "https://attacker.example" },
        data: { action: "seed" },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get("/api/cron/radar")).status()).toBe(401);
  const data = await (
    await request.get("/api/radar?kind=events&eventState=all")
  ).json();
  expect(data.items).toHaveLength(1);
  expect(data.items[0].organizer).toBe("Lynx");
  expect(data.items[0].relationship).toBe("partner");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/he/ai-radar/events/future-of-ai-2026");
  expect(sitemap).not.toContain("/admin");
});

test("an authenticated editor can add, publish, update and hide an event through the UI", async ({
  page,
}) => {
  await page.goto("/en/admin/ai-radar");
  await page
    .getByLabel("Password", { exact: true })
    .fill("radar-browser-test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Refresh sources now" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "AI Events", exact: true }).click();
  await page.getByRole("button", { name: "Add item", exact: false }).click();
  const editor = page.locator("#radar-editor");
  await editor
    .getByRole("textbox", { name: "Title en", exact: true })
    .fill("Editorial event integration test");
  await editor
    .getByRole("textbox", { name: "Title he", exact: true })
    .fill("בדיקת אירוע מערכת");
  for (const label of [
    "Summary",
    "Location",
    "Audience",
    "Verified ticket information",
  ]) {
    await editor
      .getByRole("textbox", { name: `${label} en`, exact: true })
      .fill("Verified test details");
    await editor
      .getByRole("textbox", { name: `${label} he`, exact: true })
      .fill("פרטי בדיקה מאומתים");
  }
  await editor
    .getByLabel("Source URL", { exact: true })
    .fill("https://events.lynx.co/future-of-ai/");
  await editor.getByLabel("Source name", { exact: true }).fill("Lynx");
  await editor.getByLabel("Organizer", { exact: true }).fill("Lynx");
  const start = new Date(Date.now() + 7 * 86400000).toISOString(),
    end = new Date(Date.now() + 7 * 86400000 + 3600000).toISOString();
  await editor.getByLabel("Start date & time", { exact: true }).fill(start);
  await editor.getByLabel("End date & time", { exact: true }).fill(end);
  await editor
    .getByLabel("Verification date", { exact: true })
    .fill(new Date().toISOString());
  await editor
    .getByRole("combobox", {
      name: "Schedule status (time status is automatic)",
      exact: true,
    })
    .selectOption("scheduled");
  await editor
    .getByRole("combobox", { name: "Publication status", exact: true })
    .selectOption("published");
  await editor
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  let response = await page.request.get(
    "/api/radar?kind=events&q=Editorial%20event",
  );
  let data = await response.json();
  expect(data.items).toHaveLength(1);
  const id = data.items[0].id;
  const row = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: "Editorial event integration test",
      exact: true,
    }),
  });
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .locator("#radar-editor")
    .getByRole("textbox", { name: "Title en", exact: true })
    .fill("Updated editorial event");
  await page
    .locator("#radar-editor")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await page.goto(`/en/ai-radar/events/${id}`);
  await expect(
    page
      .getByRole("heading", { name: "Updated editorial event", exact: true })
      .first(),
  ).toBeVisible();
  await page.goto("/en/admin/ai-radar");
  await page.getByRole("button", { name: "AI Events", exact: true }).click();
  const updated = page.locator("article").filter({ hasText: id });
  await updated.getByRole("button", { name: "Hide", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  data = await (
    await page.request.get("/api/radar?kind=events&q=Updated%20editorial")
  ).json();
  expect(data.items).toHaveLength(0);
});
