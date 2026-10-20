import Link from "next/link";
import { radarData, featuredContent } from "@/lib/radar/data";
import type { Locale } from "@/content/config";
import { radarCopy } from "@/content/radar";
import { OutLink } from "./RadarCard";
import { displayDate } from "@/lib/radar/domain";

export async function RadarHome({ locale }: { locale: Locale }) {
  const t = radarCopy[locale];
  const [data, featured] = await Promise.all([
    radarData({ kind: "news", limit: 3 }),
    featuredContent(),
  ]);
  return (
    <section
      className="section border-y border-line bg-cloud"
      aria-label={t.homeTitle}
    >
      <div className="shell">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">AI RADAR / FUTURE BUILDERS</p>
            <h2 className="h2 mt-3 text-brand">{t.homeTitle}</h2>
            <p className="mt-3 text-sm text-(--muted-fg)">{t.homeBody}</p>
          </div>
          <Link href={`/${locale}/ai-radar`} className="btn btn-ghost">
            {t.explore} <span aria-hidden>{locale === "he" ? "←" : "→"}</span>
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="divide-y divide-line rounded-2xl border border-line bg-white px-5">
            {data.items.map((item) => (
              <article key={item.id} className="py-5">
                <p className="mb-2 text-xs text-(--muted-fg)">
                  {item.sourceName} · {displayDate(item.publishedAt, locale)}
                </p>
                <h3 className="text-base font-medium leading-7 text-brand">
                  <OutLink href={item.sourceUrl} className="hover:text-accent">
                    {item.title[locale]}
                  </OutLink>
                </h3>
              </article>
            ))}
            {!data.items.length && (
              <p className="py-6 text-sm text-(--muted-fg)">
                {data.unavailable ? t.unavailable : t.never}
              </p>
            )}
          </div>
          <div className="grid gap-4">
            {featured.model && (
              <article className="rounded-2xl border border-line bg-white p-5">
                <p className="eyebrow">{t.models}</p>
                <h3 className="mt-3 text-lg font-medium text-brand">
                  <OutLink href={featured.model.sourceUrl}>
                    {featured.model.title[locale]}
                  </OutLink>
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--muted-fg)">
                  {featured.model.summary[locale]}
                </p>
              </article>
            )}
            {featured.event && (
              <article className="rounded-2xl border border-accent/25 bg-accent/5 p-5">
                <p className="eyebrow">{t.upcoming}</p>
                <h3 className="mt-3 text-lg font-medium text-brand">
                  <Link
                    href={`/${locale}/ai-radar?kind=events&eventState=upcoming`}
                  >
                    {featured.event.title[locale]} ↗
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-(--muted-fg)">
                  {displayDate(
                    featured.event.startsAt,
                    locale,
                    featured.event.timezone,
                  )}{" "}
                  · {featured.event.location[locale]}
                </p>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
