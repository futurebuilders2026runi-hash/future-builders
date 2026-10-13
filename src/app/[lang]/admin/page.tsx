import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminControls } from "@/components/admin/AdminControls";
import { getDict, isLocale } from "@/content";
import { degreeValues, yearValues, type ApplicationRecord } from "@/lib/application-schema";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { listApplications } from "@/lib/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Future Builders — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const t = dict.admin;
  const f = dict.apply.fields;
  const authenticated = await isAdmin();
  let applications: ApplicationRecord[] = [];
  let loadError = false;
  if (authenticated) {
    try { applications = await listApplications(); }
    catch {
      loadError = true;
      console.error("[future-builders] failed to load admin applications");
    }
  }

  const formatter = new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-GB", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jerusalem",
  });

  return (
    <section className="min-h-screen bg-cloud pb-20 pt-32 sm:pt-40">
      <div className="shell max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h1 mt-4 text-brand">{t.title}</h1>
            <p className="mt-4 text-(--muted-fg)">{authenticated ? t.body : t.loginBody}</p>
          </div>
          {authenticated && <AdminControls dict={dict} />}
        </div>

        {!authenticated ? <AdminLogin dict={dict} configured={adminConfigured()} /> : loadError ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{t.loadError}</p>
        ) : (
          <>
            <p className="mb-5 font-medium text-brand">{applications.length} {t.total}</p>
            {applications.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-9 text-center">
                <h2 className="h3">{t.emptyTitle}</h2>
                <p className="mt-3 text-(--muted-fg)">{t.emptyBody}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => {
                  const degree = f.degreeOptions[degreeValues.indexOf(application.degree)] ?? application.degree ?? "—";
                  const year = f.yearOptions[yearValues.indexOf(application.year)] ?? application.year ?? "—";
                  const date = new Date(application.submittedAt);
                  return (
                    <details key={application.id} className="group rounded-2xl border border-line bg-white">
                      <summary className="cursor-pointer rounded-2xl p-6 focus-visible:outline-2 focus-visible:outline-accent sm:p-7">
                        <span className="ms-2 inline-flex max-w-full flex-col gap-2 align-middle">
                          <span className="text-lg font-semibold text-brand">{application.fullName || `${application.firstName} ${application.lastName}`}</span>
                          <span className="text-sm text-(--muted-fg)">{degree} · {year}</span>
                          <span className="text-xs text-(--muted-fg)">{t.submittedAt}: {Number.isNaN(date.getTime()) ? "—" : formatter.format(date)}</span>
                          <span className="mt-1 text-sm font-medium text-accent">{t.details}</span>
                        </span>
                      </summary>
                      <dl className="grid gap-6 border-t border-line p-6 sm:grid-cols-2 sm:p-7">
                        {[
                          [f.firstName, application.firstName || application.fullName || "—"],
                          [f.lastName, application.lastName || "—"],
                          [f.degree, degree],
                          [f.year, year],
                        ].map(([label, value]) => (
                          <div key={label}><dt className="field-label">{label}</dt><dd className="break-words">{value}</dd></div>
                        ))}
                        <div><dt className="field-label">{f.phone}</dt><dd><a href={`tel:${application.phone?.replace(/[^\d+]/g, "") ?? ""}`} dir="ltr" className="inline-block break-all text-accent underline">{application.phone || "—"}</a></dd></div>
                        <div><dt className="field-label">{f.email}</dt><dd><a href={`mailto:${encodeURIComponent(application.email)}`} dir="ltr" className="inline-block break-all text-accent underline">{application.email}</a></dd></div>
                        {[
                          [f.why, application.why],
                          [f.background, application.background],
                          [f.aiExperience, application.aiExperience || t.noAiExperience],
                        ].map(([label, value]) => (
                          <div key={label} className="sm:col-span-2"><dt className="field-label">{label}</dt><dd className="whitespace-pre-wrap break-words leading-relaxed">{value || "—"}</dd></div>
                        ))}
                      </dl>
                    </details>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
