import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { listApplications } from "@/lib/applications";

export const runtime = "nodejs";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  if (!await isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  try {
    return NextResponse.json({ applications: await listApplications() }, { headers });
  } catch {
    console.error("[future-builders] failed to load applications");
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503, headers });
  }
}
