import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content";
import { radarCopy } from "@/content/radar";
import { isAdmin, adminConfigured } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminControls } from "@/components/admin/AdminControls";
import { RadarAdmin } from "@/components/radar/RadarAdmin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "AI Radar — Admin",
  robots: { index: false, follow: false },
};

export default async function RadarAdminPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const t = radarCopy[lang];
  const authenticated = await isAdmin();
  return (
    <section className="min-h-[70vh] bg-cloud pb-16 pt-28">
      <div className="shell max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">FUTURE BUILDERS / ADMIN</p>
            <h1 className="h2 mt-3 text-brand">{t.adminTitle}</h1>
            <p className="mt-3 text-sm text-(--muted-fg)">{t.adminBody}</p>
          </div>
          {authenticated && (
            <div className="flex flex-wrap gap-3">
              <Link href={`/${lang}/admin`} className="btn btn-ghost">
                {t.applications}
              </Link>
              <AdminControls dict={dict} />
            </div>
          )}
        </div>
        {authenticated ? (
          <RadarAdmin locale={lang} />
        ) : (
          <AdminLogin dict={dict} configured={adminConfigured()} />
        )}
      </div>
    </section>
  );
}
