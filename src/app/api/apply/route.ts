import { NextResponse } from "next/server";
import { saveApplication } from "@/lib/applications";
import { validateApplication } from "@/lib/application-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const validation = validateApplication(body);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    await saveApplication(validation.data);
  } catch (error) {
    console.error("[future-builders] failed to deliver application", error);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
