import "server-only";

import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { WORKSHOP_ID, type WorkshopData, type WorkshopRecord } from "./workshop-schema";

// Same storage rules as club applications (see applications.ts): Supabase when
// configured, a local file only in development.
function storageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const headers: Record<string, string> = { apikey: key };
    if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
    return { endpoint: `${url.replace(/\/$/, "")}/rest/v1/workshop_registrations`, headers };
  }
  if (url || key || process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("Workshop registration storage is not configured");
  }
  return null;
}

const localFile = () => path.join(process.cwd(), ".data", "workshop-registrations.jsonl");

export async function saveWorkshopRegistration(data: WorkshopData): Promise<void> {
  const record: WorkshopRecord = {
    ...data,
    id: randomUUID(),
    workshop: WORKSHOP_ID,
    submittedAt: new Date().toISOString(),
  };
  const config = storageConfig();
  if (config) {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { ...config.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Workshop registration insert failed (${response.status})`);
    return;
  }
  await mkdir(path.dirname(localFile()), { recursive: true, mode: 0o700 });
  await appendFile(localFile(), `${JSON.stringify(record)}\n`, { mode: 0o600 });
}

export async function listWorkshopRegistrations(): Promise<WorkshopRecord[]> {
  const config = storageConfig();
  if (config) {
    const records: WorkshopRecord[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const params = new URLSearchParams({
        select: "*",
        workshop: `eq.${WORKSHOP_ID}`,
        order: "submittedAt.desc,id.desc",
        limit: String(pageSize),
        offset: String(offset),
      });
      const response = await fetch(`${config.endpoint}?${params}`, {
        headers: config.headers,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Workshop registration list failed (${response.status})`);
      const page: WorkshopRecord[] = await response.json();
      records.push(...page);
      if (page.length < pageSize) return records;
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
    .map((line) => JSON.parse(line) as WorkshopRecord)
    .filter((r) => r.workshop === WORKSHOP_ID)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
