"use client";

import { useEffect } from "react";

const VISITOR_KEY = "fb_visitor";

/** Anonymous per-browser id, so the admin can tell repeat opens from new people. */
function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** ?src= or ?utm_source= first, otherwise the referring site, otherwise nothing ("direct"). */
function source(): string | undefined {
  const params = new URLSearchParams(location.search);
  const tagged = params.get("src") || params.get("utm_source");
  if (tagged) return tagged;
  try {
    const ref = document.referrer && new URL(document.referrer);
    if (ref && ref.host !== location.host) return ref.host.replace(/^www\./, "");
  } catch {}
  return undefined;
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon?.("/api/track", body)) return;
  fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}

// React dev mode runs effects twice; don't double-count the same open.
let lastView = 0;

/**
 * Counts one open of a tracked page, plus clicks on any element inside the page
 * marked `data-track="register"`. Renders nothing.
 */
export function LinkTracker({ slug, lang }: { slug: string; lang: string }) {
  useEffect(() => {
    const visitor = visitorId();
    const src = source();

    if (Date.now() - lastView > 1000) {
      lastView = Date.now();
      send({ slug, event: "view", lang, source: src, visitor });
    }

    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('[data-track="register"]')) {
        send({ slug, event: "register_click", lang, source: src, visitor });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug, lang]);

  return null;
}
