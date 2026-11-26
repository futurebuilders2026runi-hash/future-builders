import { NextResponse } from "next/server";
import { getPoolIdeaUsage } from "@/lib/workshop-registrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Idea-pool availability for the public workshop form: counts and first names only. */
export async function GET() {
  try {
    return NextResponse.json(await getPoolIdeaUsage(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[future-builders] failed to load idea-pool usage", error);
    return NextResponse.json({ error: "load_failed" }, { status: 502 });
  }
}
