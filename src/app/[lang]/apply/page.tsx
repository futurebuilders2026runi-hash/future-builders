import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircuitCorner, Waves } from "@/components/BrandDecor";
import { CircuitFlow } from "@/components/CircuitFlow";
import { ApplyForm } from "@/components/forms/ApplyForm";
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
    title: dict.meta.applyTitle,
    description: dict.meta.applyDescription,
    alternates: { canonical: `/${lang}/apply` },
  };
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getDict(locale);

  return (
    <>
      <section className="brand-sky relative overflow-hidden">
        <CircuitFlow variant={0} />
        <CircuitCorner className="end-0 top-0 opacity-70 rtl:-scale-x-100" />
        <div className="glow -top-20 start-1/3 h-80 w-80 bg-accent/25" aria-hidden />
        <Waves lines={14} />

        <div className="shell relative pb-20 pt-32 sm:pt-40">
          <Reveal>
            <p className="eyebrow">{dict.apply.eyebrow}</p>
            <h1 className="h1 mt-5 max-w-3xl text-brand">{dict.apply.title}</h1>
            <p className="lede mt-6 max-w-xl">{dict.apply.body}</p>
          </Reveal>
        </div>
      </section>

      <section className="section relative overflow-hidden bg-cloud">
        <CircuitFlow variant={3} />
        <div className="shell relative max-w-3xl">
          <ApplyForm locale={locale} dict={dict} />
        </div>
      </section>
    </>
  );
}
