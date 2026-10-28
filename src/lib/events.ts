import { clubEvents } from "@/content/config";

/** Date-only events remain visible through their calendar day in Israel. */
export function isUpcomingDate(date: string | undefined, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return !!date && date >= today;
}

export function getUpcomingEvents(now = new Date()) {
  return clubEvents
    .filter((event) => isUpcomingDate(event.date, now))
    .sort((a, b) => a.date!.localeCompare(b.date!));
}
