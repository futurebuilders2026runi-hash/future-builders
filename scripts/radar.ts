import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function main() {
  const command = process.argv[2];
  if (!process.env.NODE_ENV)
    Object.assign(process.env, { NODE_ENV: "development" });
  const { seedRadar } = await import("../src/lib/radar/seed");
  const { importRadar } = await import("../src/lib/radar/importer");

  if (command === "migrate") {
    const { readFile } = await import("node:fs/promises");
    const { default: pg } = await import("pg");
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString)
      throw new Error(
        "Set DIRECT_URL to run migrations, or use the Supabase SQL editor.",
      );
    const client = new pg.Client({
      connectionString,
      connectionTimeoutMillis: 15000,
    });
    try {
      await client.connect();
      await client.query(await readFile("supabase/ai-radar.sql", "utf8"));
      console.log("AI Radar migration applied.");
    } finally {
      await client.end();
    }
  } else if (command === "seed") {
    console.log(await seedRadar());
  } else if (command === "import") {
    const job = await importRadar();
    console.log(JSON.stringify(job, null, 2));
    if (job?.status === "failed") process.exitCode = 1;
  } else if (command === "worker") {
    await seedRadar();
    const run = async () => {
      try {
        const job = await importRadar();
        console.log(new Date().toISOString(), job?.status, job?.inserted);
      } catch {
        console.error("Radar import failed; retrying at next interval.");
      }
    };
    await run();
    setInterval(run, 6 * 60 * 60 * 1000);
  } else if (command === "export") {
    const { list } = await import("../src/lib/radar/store");
    const { collections } = await import("../src/lib/radar/schema");
    const { mkdir, writeFile } = await import("node:fs/promises");
    const backup = Object.fromEntries(
      await Promise.all(
        [...collections, "jobs", "reviews", "audit"].map(async (name) => [
          name,
          await list(
            name as (typeof collections)[number] | "jobs" | "reviews" | "audit",
          ),
        ]),
      ),
    );
    await mkdir(".data/backups", { recursive: true, mode: 0o700 });
    const file = `.data/backups/radar-${Date.now()}.json`;
    await writeFile(file, JSON.stringify(backup, null, 2), { mode: 0o600 });
    console.log(file);
  } else if (command === "localize") {
    const { applyReviewedHebrew } = await import("../src/content/radar-translations");
    const { recordSchema } = await import("../src/lib/radar/schema");
    const { list, put } = await import("../src/lib/radar/store");
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { randomUUID } = await import("node:crypto");
    const rows = await list("news");
    const changes = rows.flatMap((before) => {
      const translated = applyReviewedHebrew(before);
      if (translated === before) return [];
      const after = recordSchema.parse({ ...translated, updatedAt: new Date().toISOString() });
      if (after.kind !== "news") throw new Error("Expected news");
      return [{ before, after }];
    });
    if (changes.length) {
      await mkdir(".data/backups", { recursive: true, mode: 0o700 });
      await writeFile(`.data/backups/radar-he-${Date.now()}.json`, JSON.stringify(rows, null, 2), { mode: 0o600 });
    }
    for (const { before, after } of changes) {
      await put("audit", { id: randomUUID(), at: after.updatedAt, action: "translate-he", kind: "news", contentId: after.id, before, after, actor: "admin" });
      await put("news", after);
      await put("reviews", { id: after.id, contentId: after.id, kind: "news", status: after.status === "published" ? "approved" : after.status === "hidden" ? "hidden" : "pending", reason: "Hebrew headline and source-based summary reviewed; existing publication decision preserved.", updatedAt: after.updatedAt });
    }
    console.log({ translated: changes.length, total: rows.length });
  } else {
    console.error(
      "Usage: tsx scripts/radar.ts migrate|seed|import|worker|export|localize",
    );
    process.exitCode = 1;
  }
}
main().catch(() => {
  console.error(
    "AI Radar command failed. Check storage configuration and the migration; credentials are never logged.",
  );
  process.exitCode = 1;
});
