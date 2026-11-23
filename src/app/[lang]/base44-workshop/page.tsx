import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircuitCorner, Waves } from "@/components/BrandDecor";
import { CircuitFlow } from "@/components/CircuitFlow";
import { WorkshopForm } from "@/components/forms/WorkshopForm";
import { Reveal } from "@/components/Reveal";
import { getDict } from "@/content";
import { isLocale, type Locale } from "@/content/config";

const POSTER = "/events/base44-workshop.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.meta.workshopTitle,
    description: dict.meta.workshopDescription,
    alternates: { canonical: `/${lang}/base44-workshop` },
    // Page-level openGraph replaces the layout's, so it is spelled out in full.
    openGraph: {
      type: "website",
      siteName: "Future Builders",
      title: dict.meta.workshopTitle,
      description: dict.meta.workshopDescription,
      url: `/${lang}/base44-workshop`,
      locale: lang === "he" ? "he_IL" : "en_US",
      images: [{ url: POSTER, width: 1000, height: 1000, alt: dict.workshop.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.workshopTitle,
      description: dict.meta.workshopDescription,
      images: [POSTER],
    },
  };
}

export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getDict(locale);
  const t = dict.workshop;

  return (
    <>
      <section className="brand-sky relative overflow-hidden">
        <CircuitFlow variant={0} />
        <CircuitCorner className="end-0 top-0 opacity-70 rtl:-scale-x-100" />
        <div className="glow -top-20 start-1/3 h-80 w-80 bg-accent/25" aria-hidden />
        <Waves lines={14} />

        <div className="shell relative grid items-center gap-8 pb-10 pt-24 sm:pt-26 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <Reveal className="text-center lg:text-start">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h1 mt-3 text-brand">{t.title}</h1>
            <p className="lede mx-auto mt-4 max-w-xl lg:mx-0">{t.body}</p>

            <dl className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-2 sm:gap-3 lg:mx-0">
              {t.details.map((detail) => (
                <div key={detail.label} className="rounded-2xl border border-line bg-white/70 px-3 py-3 backdrop-blur sm:px-4">
                  <dt className="text-xs font-medium text-accent">{detail.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-brand sm:text-base">
                    <bdi>{detail.value}</bdi>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-sm font-semibold">
              <span className="grad-text">{t.seats}</span>
            </p>
          </Reveal>

          <Reveal delay={0.1} y={24} className="order-first lg:order-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={POSTER}
              alt={t.imageAlt}
              width={1000}
              height={1000}
              className="mx-auto w-full max-w-sm rounded-3xl shadow-[0_40px_80px_-40px_rgb(11_42_107/0.55)] ring-1 ring-black/5 lg:max-w-md"
            />
          </Reveal>
        </div>
      </section>

      <section id="register" className="section relative overflow-hidden bg-cloud">
        <CircuitFlow variant={3} />
        <div className="shell relative max-w-3xl">
          <WorkshopForm locale={locale} dict={dict} />
        </div>
      </section>
    </>
  );
}
