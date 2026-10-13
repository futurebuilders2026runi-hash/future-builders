import { NextResponse } from "next/server";
import { adminConfigured, adminCookie, checkAdminPassword, createAdminSession, loginRateLimited, sameOrigin, sessionSeconds } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  if (loginRateLimited(request)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "900" } });
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const password = body && typeof body === "object" && "password" in body ? body.password : undefined;
  if (typeof password !== "string" || password.length > 256 || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(adminCookie, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionSeconds,
  });
  return response;
}
