import type { Dict } from "@/content";
import type { Locale } from "@/content/config";
import { workshopDegreeValues, workshopYearValues, type WorkshopRecord } from "@/lib/workshop-schema";

const SEATS = 50;

/** Admin list of Base44 workshop registrations, with a seat counter. */
export function WorkshopRegistrationsPanel({
  dict,
  locale,
  registrations,
}: {
  dict: Dict;
  locale: Locale;
  registrations: WorkshopRecord[] | null;
}) {
  const t = dict.admin.workshopRegs;
  const f = dict.workshop.fields;
  const formatter = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem",
  });

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
          href={`/${locale}/base44-workshop`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          {t.page} ↗
        </a>
      </div>

      {!registrations ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t.loadError}
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-(--muted-fg)">
            <span className="text-2xl font-semibold tabular-nums text-brand">{registrations.length}</span>{" "}
            {t.of} {SEATS} {t.seats}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-cloud" aria-hidden>
            <div
              className="h-full rounded-full bg-linear-to-r from-accent to-accent-bright"
              style={{ width: `${Math.min(100, (registrations.length / SEATS) * 100)}%` }}
            />
          </div>

          {registrations.length === 0 ? (
            <p className="mt-4 text-sm text-(--muted-fg)">{t.empty}</p>
          ) : (
            <div className="mt-4 grid gap-2">
              {registrations.map((r) => {
                const date = new Date(r.submittedAt);
                // Registrations from before 26.11.2026 have no track or year.
                const degree = f.degreeOptions[workshopDegreeValues.indexOf(r.degree)] ?? "—";
                const year = f.yearOptions[workshopYearValues.indexOf(r.year)] ?? "—";
                return (
                  <details key={r.id} className="rounded-xl border border-line">
                    <summary className="cursor-pointer rounded-xl p-3 focus-visible:outline-2 focus-visible:outline-accent sm:p-4">
                      <span className="ms-2 inline-flex max-w-full flex-col gap-1 align-middle">
                        <span className="font-semibold text-brand">{r.fullName}</span>
                        <span className="text-xs text-(--muted-fg)">
                          {degree} · {year} · {r.participation === "team" ? t.team : t.solo} ·{" "}
                          {Number.isNaN(date.getTime()) ? "—" : formatter.format(date)}
                        </span>
                      </span>
                    </summary>
                    <dl className="grid gap-3 border-t border-line p-3 text-sm sm:grid-cols-2 sm:p-4">
                      <div>
                        <dt className="field-label">{f.phone}</dt>
                        <dd>
                          <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} dir="ltr" className="inline-block break-all text-accent underline">
                            {r.phone}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="field-label">{f.email}</dt>
                        <dd>
                          <a href={`mailto:${encodeURIComponent(r.email)}`} dir="ltr" className="inline-block break-all text-accent underline">
                            {r.email}
                          </a>
                        </dd>
                      </div>
                      {r.participation === "team" && (
                        <div className="sm:col-span-2">
                          <dt className="field-label">{t.teamMembers}</dt>
                          <dd className="whitespace-pre-wrap break-words">{r.teamMembers || "—"}</dd>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <dt className="field-label">{t.idea}</dt>
                        <dd className="whitespace-pre-wrap break-words leading-relaxed">{r.idea || "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="field-label">{t.aiDaily}</dt>
                        <dd className="whitespace-pre-wrap break-words leading-relaxed">{r.aiDaily || "—"}</dd>
                      </div>
                    </dl>
                  </details>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
