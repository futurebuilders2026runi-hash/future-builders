import type { Dict } from "@/content";
import { conference, type Locale } from "@/content/config";
import type { LinkStats } from "@/lib/link-events";

/** Admin summary of how often the conference page link was opened. */
export function LinkStatsPanel({
  dict,
  locale,
  stats,
}: {
  dict: Dict;
  locale: Locale;
  stats: LinkStats | null;
}) {
  const t = dict.admin.linkStats;
  const formatter = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem",
  });
  const peak = Math.max(1, ...(stats?.daily.map((d) => d.opens) ?? [0]));

  return (
    <section className="mb-6 rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h3 mt-2 text-brand">
            <bdi>{t.title}</bdi>
          </h2>
        </div>
        <a
          href={`/${locale}${conference.path}`}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          /{locale}
          {conference.path}
        </a>
      </div>

      {!stats ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t.loadError}
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [t.opens, stats.opens],
              [t.unique, stats.uniqueVisitors],
              [t.clicks, stats.registerClicks],
              [t.today, stats.today],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-cloud px-4 py-3">
                <dt className="text-xs text-(--muted-fg)">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-brand">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-xs text-(--muted-fg)">
            {t.last}: {stats.last ? formatter.format(new Date(stats.last)) : t.empty}
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h3 className="field-label">{t.daily}</h3>
              {/* Oldest → newest left to right, in both languages */}
              <ol dir="ltr" className="mt-2 flex h-28 items-end gap-1">
                {stats.daily.map((d) => (
                  <li key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[0.625rem] tabular-nums text-(--muted-fg)">{d.opens || ""}</span>
                    <span
                      className="w-full rounded-t bg-linear-to-t from-accent to-accent-bright"
                      style={{ height: `${(d.opens / peak) * 100}%`, minHeight: d.opens ? 4 : 1 }}
                      title={`${d.day}: ${d.opens}`}
                    />
                    <span className="text-[0.625rem] tabular-nums text-(--muted-fg)">
                      {d.day.slice(8)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="field-label">{t.sources}</h3>
              {stats.sources.length === 0 ? (
                <p className="mt-2 text-sm text-(--muted-fg)">{t.empty}</p>
              ) : (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {stats.sources.map((s) => (
                    <li key={s.source} className="flex justify-between gap-3 py-1.5">
                      <bdi>{s.source === "direct" ? t.direct : s.source}</bdi>
                      <span className="tabular-nums font-medium text-brand">{s.opens}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-(--muted-fg)">
            {t.tip}{" "}
            <code dir="ltr" className="inline-block rounded bg-cloud px-1.5 py-0.5 text-brand">
              {conference.path}?src=whatsapp
            </code>
          </p>
        </>
      )}
    </section>
  );
}
