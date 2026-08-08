import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/content/config";

const PUBLIC_FILE = /\.[a-z0-9]+$/i;

/** Sends every un-prefixed path to a locale, preferring the browser's language. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  // Every first visit lands on Hebrew, whatever the browser asks for.
  // English is reached only by choosing it in the header.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
