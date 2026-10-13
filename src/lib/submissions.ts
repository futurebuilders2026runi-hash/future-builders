import "server-only";

export type SubmissionKind = "application" | "partner";

const MAX_FIELD_LENGTH = 4000;

export type FieldSpec = { key: string; required?: boolean };

/** Trims, length-caps and drops unknown keys. Returns null if a required field is missing. */
export function sanitize(
  body: unknown,
  spec: FieldSpec[],
): Record<string, string> | null {
  if (typeof body !== "object" || body === null) return null;
  const source = body as Record<string, unknown>;
  const out: Record<string, string> = {};

  for (const { key, required } of spec) {
    const raw = source[key];
    const value = typeof raw === "string" ? raw.trim().slice(0, MAX_FIELD_LENGTH) : "";
    if (required && !value) return null;
    if (value) out[key] = value;
  }
  return out;
}

export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * Delivers a submission to whichever destinations are configured via env vars:
 *
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  → insert into `applications` / `partner_requests`
 *   SUBMISSIONS_WEBHOOK_URL                   → POST the payload (Slack, Make, Zapier, …)
 *
 * With nothing configured the submission is logged to the server console so the
 * site still works out of the box in development.
 */
export async function deliver(
  kind: SubmissionKind,
  payload: Record<string, string>,
): Promise<void> {
  const record = {
    ...payload,
    kind,
    submittedAt: new Date().toISOString(),
  };

  const targets: Promise<void>[] = [];

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    const table = kind === "application" ? "applications" : "partner_requests";
    targets.push(
      fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          ...(!supabaseKey.startsWith("sb_secret_") ? { Authorization: `Bearer ${supabaseKey}` } : {}),
          Prefer: "return=minimal",
        },
        body: JSON.stringify(record),
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
        }
      }),
    );
  }

  const webhook = process.env.SUBMISSIONS_WEBHOOK_URL;
  if (webhook) {
    targets.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Webhook failed: ${res.status} ${await res.text()}`);
        }
      }),
    );
  }

  if (targets.length === 0) {
    console.info(
      `[future-builders] ${kind} submission (no delivery target configured):`,
      record,
    );
    return;
  }

  await Promise.all(targets);
}
