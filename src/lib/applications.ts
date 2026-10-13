import "server-only";

import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ApplicationData, ApplicationRecord } from "./application-schema";

function storageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const headers: Record<string, string> = { apikey: key };
    if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
    return {
      endpoint: `${url.replace(/\/$/, "")}/rest/v1/applications`,
      headers,
    };
  }
  // Never acknowledge a production registration without durable storage.
  if (url || key || process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("Application storage is not configured");
  }
  return null;
}

const localFile = () => path.join(process.cwd(), ".data", "applications.jsonl");

export async function saveApplication(data: ApplicationData): Promise<void> {
  const record: ApplicationRecord = {
    ...data,
    id: randomUUID(),
    fullName: `${data.firstName} ${data.lastName}`,
    kind: "application",
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
    if (!response.ok) throw new Error(`Application insert failed (${response.status})`);
  } else {
    await mkdir(path.dirname(localFile()), { recursive: true, mode: 0o700 });
    await appendFile(localFile(), `${JSON.stringify(record)}\n`, { mode: 0o600 });
  }

  // A notification failure must not turn a successfully saved registration into
  // an error that asks the applicant to submit the same registration again.
  const webhook = process.env.SUBMISSIONS_WEBHOOK_URL;
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) console.error(`[future-builders] application notification failed (${response.status})`);
    } catch {
      console.error("[future-builders] application notification failed; registration is saved");
    }
  }
}

export async function listApplications(): Promise<ApplicationRecord[]> {
  const config = storageConfig();
  if (config) {
    // Paginate so registrations past Supabase's per-request row limit are visible.
    const records: ApplicationRecord[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const params = new URLSearchParams({ select: "*", order: "submittedAt.desc,id.desc", limit: String(pageSize), offset: String(offset) });
      const response = await fetch(`${config.endpoint}?${params}`, {
        headers: config.headers,
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Application list failed (${response.status})`);
      const page: ApplicationRecord[] = await response.json();
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
  return contents.split("\n").filter(Boolean)
    .map((line) => JSON.parse(line) as ApplicationRecord)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
