import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookie = "fb_admin_session";
export const sessionSeconds = 8 * 60 * 60;

export function adminConfigured() {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12 &&
    (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32;
}

function equal(a: string, b: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function checkAdminPassword(password: string) {
  return adminConfigured() && equal(password, process.env.ADMIN_PASSWORD!);
}

function signature(value: string) {
  return createHmac("sha256", `${process.env.ADMIN_SESSION_SECRET}:${process.env.ADMIN_PASSWORD}`)
    .update(value).digest("base64url");
}

export function createAdminSession() {
  if (!adminConfigured()) throw new Error("Admin authentication is not configured");
  const value = `${Math.floor(Date.now() / 1000) + sessionSeconds}.${randomBytes(24).toString("base64url")}`;
  return `${value}.${signature(value)}`;
}

export function verifyAdminSession(token?: string) {
  if (!adminConfigured() || !token || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiry, nonce, signed] = parts;
  const expires = Number(expiry);
  const now = Math.floor(Date.now() / 1000);
  return Number.isInteger(expires) && expires > now && expires <= now + sessionSeconds &&
    /^[A-Za-z0-9_-]{32}$/.test(nonce) && equal(signed, signature(`${expiry}.${nonce}`));
}

export async function isAdmin() {
  return verifyAdminSession((await cookies()).get(adminCookie)?.value);
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

// Limits repeated guesses within each running server; host-level throttling can
// supplement this when a deployment uses multiple instances.
const attempts = new Map<string, { count: number; expires: number }>();
const windowMs = 15 * 60 * 1000;

export function loginRateLimited(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = createHash("sha256").update(address).digest("hex");
  const now = Date.now();
  for (const [entry, value] of attempts) {
    if (value.expires <= now) attempts.delete(entry);
  }
  const current = attempts.get(key);
  if (current && current.count >= 5) return true;
  if (attempts.size >= 10000 && !current) return true;
  attempts.set(key, { count: (current?.count ?? 0) + 1, expires: current?.expires ?? now + windowMs });
  return false;
}
