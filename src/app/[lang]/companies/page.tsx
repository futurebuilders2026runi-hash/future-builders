import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircuitCorner, Waves } from "@/components/BrandDecor";
import { CircuitFlow } from "@/components/CircuitFlow";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { Reveal } from "@/components/Reveal";
import { getDict } from "@/content";
import { isLocale, type Locale } from "@/content/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.meta.companiesTitle,
    description: dict.meta.companiesDescription,
    alternates: { canonical: `/${lang}/companies` },
  };
}

export default async function CompaniesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getDict(locale);
  const t = dict.companies;

  return (
    <>
      {/* Hero */}
      <section className="brand-sky relative overflow-hidden">
        <CircuitFlow variant={1} />
        <CircuitCorner className="end-0 top-0 opacity-70 rtl:-scale-x-100" />
        <div
          className="glow -top-24 end-[-4%] h-96 w-96 bg-accent-bright/25"
          aria-hidden
        />
        <Waves />

        <div className="shell relative pb-20 pt-32 sm:pt-40">
          <Reveal>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="display mt-6 max-w-4xl text-brand">{t.title}</h1>
            <p className="lede mt-6 max-w-2xl">{t.body}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="#partner-form" className="btn btn-primary">
                {t.primaryCta}
              </Link>
              <Link href={`/${locale}#program`} className="btn btn-ghost">
                {t.secondaryCta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Who we are / what students build */}
      <section className="section relative overflow-hidden bg-white">
        <CircuitFlow variant={2} />
        <div className="shell relative grid gap-10 md:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="h2">{t.whoTitle}</h2>
            <p className="lede mt-5">{t.whoBody}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="h2">{t.buildTitle}</h2>
            <p className="lede mt-5">{t.buildBody}</p>
          </Reveal>
        </div>
      </section>

      {/* Ways to collaborate */}
      <section className="section relative overflow-hidden bg-cloud">
        <CircuitFlow variant={3} />
        <div className="shell relative">
          <Reveal>
            <h2 className="h2 max-w-xl">{t.waysTitle}</h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.ways.map((way, i) => (
              <Reveal as="li" key={way.title} delay={(i % 3) * 0.06}>
                <article className="card h-full">
                  <span className="text-xs font-semibold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h3 mt-3">{way.title}</h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                    {way.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Why partner */}
      <section className="on-dark section relative overflow-hidden bg-navy">
        <div className="grid-veil" aria-hidden />
        <CircuitFlow variant={4} tone="dark" />
        <div className="shell relative">
          <Reveal>
            <h2 className="h2 max-w-xl text-white">{t.whyTitle}</h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.07}>
                <article className="card h-full">
                  <h3 className="h3 text-white">{item.title}</h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-white/55">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Form */}
      <section id="partner-form" className="section relative overflow-hidden bg-cloud">
        <CircuitFlow variant={5} />
        <div className="shell relative max-w-2xl">
          <PartnerForm locale={locale} dict={dict} />
        </div>
      </section>
    </>
  );
}
