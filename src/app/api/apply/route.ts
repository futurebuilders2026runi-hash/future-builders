import { NextResponse } from "next/server";
import { deliver, isEmail, sanitize } from "@/lib/submissions";

export const runtime = "nodejs";

const FIELDS = [
  { key: "fullName", required: true },
  { key: "email", required: true },
  { key: "phone" },
  { key: "year" },
  { key: "linkedin" },
  { key: "github" },
  { key: "portfolio" },
  { key: "why", required: true },
  { key: "built", required: true },
  { key: "interest" },
  { key: "aiExperience" },
  { key: "projectLink" },
  { key: "locale" },
];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data = sanitize(body, FIELDS);
  if (!data) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!isEmail(data.email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    await deliver("application", data);
  } catch (error) {
    console.error("[future-builders] failed to deliver application", error);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
