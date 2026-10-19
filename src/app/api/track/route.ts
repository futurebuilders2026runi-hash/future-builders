import { NextResponse } from "next/server";
import { parseLinkEvent, recordLinkEvent } from "@/lib/link-events";

export const runtime = "nodejs";

// Link-preview fetchers and headless browsers don't run the page script, but
// filter them here too in case one does.
const BOT = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|headless|lighthouse/i;

export async function POST(request: Request) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) {
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    // sendBeacon posts text/plain, so read the raw body.
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const event = parseLinkEvent(body);
  if (!event) return NextResponse.json({ error: "invalid_event" }, { status: 400 });

  try {
    await recordLinkEvent(event);
  } catch (error) {
    console.error("[future-builders] failed to record link event", error);
    return NextResponse.json({ error: "storage_failed" }, { status: 502 });
  }

  return new NextResponse(null, { status: 204 });
}
