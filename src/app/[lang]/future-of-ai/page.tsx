import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircuitCorner, Waves } from "@/components/BrandDecor";
import { CircuitFlow } from "@/components/CircuitFlow";
import { LinkTracker } from "@/components/LinkTracker";
import { Reveal } from "@/components/Reveal";
import { getDict } from "@/content";
import { conference, isLocale } from "@/content/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.meta.conferenceTitle,
    description: dict.meta.conferenceDescription,
    alternates: { canonical: `/${lang}${conference.path}` },
    // Page-level openGraph replaces the layout's, so it is spelled out in full.
    openGraph: {
      type: "website",
      siteName: "Future Builders",
      title: dict.meta.conferenceTitle,
      description: dict.meta.conferenceDescription,
      url: `/${lang}${conference.path}`,
      locale: lang === "he" ? "he_IL" : "en_US",
      images: [
        {
          url: conference.ogImage,
          width: 1200,
          height: 630,
          alt: dict.conference.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.conferenceTitle,
      description: dict.meta.conferenceDescription,
      images: [conference.ogImage],
    },
  };
}

/** External registration link — the URL already carries the discount code. */
function RegisterButton({ label }: { label: string }) {
  return (
    <a
      href={conference.registerUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-track="register"
      className="btn btn-primary w-full sm:w-auto"
    >
      {label}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="rtl:-scale-x-100"
      >
        <path
          d="M4 10L10 4m0 0H5m5 0v5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = getDict(lang).conference;

  return (
    <>
      <LinkTracker slug="future-of-ai" lang={lang} />

      {/* Hero */}
      <section className="brand-sky relative overflow-hidden">
        <CircuitFlow variant={1} />
        <CircuitCorner className="end-0 top-0 opacity-70 rtl:-scale-x-100" />
        <div
          className="glow -top-24 start-[-6%] h-96 w-96 bg-accent/25"
          aria-hidden
        />
        <Waves />

        <div className="shell relative grid items-center gap-8 pb-12 pt-24 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-16">
          <Reveal className="text-center lg:text-start">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="display mt-4 text-brand">
              <bdi>{t.title}</bdi>
            </h1>
            <p className="lede mx-auto mt-4 max-w-xl lg:mx-0">{t.body}</p>

            <dl className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2 lg:mx-0">
              {t.details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-2xl border border-line bg-white/70 px-5 py-4 backdrop-blur"
                >
                  <dt className="text-xs font-medium tracking-wide text-accent">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tracking-tight text-brand">
                    <bdi>{detail.value}</bdi>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <RegisterButton label={t.cta} />
              <p className="mt-3 text-sm text-(--muted-fg)">{t.ctaNote}</p>
            </div>
          </Reveal>

          <Reveal delay={0.12} y={26} className="order-first lg:order-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={conference.image}
              alt={t.imageAlt}
              width={1080}
              height={1350}
              className="mx-auto w-full max-w-sm rounded-3xl shadow-[0_40px_80px_-40px_rgb(11_42_107/0.55)] ring-1 ring-black/5 lg:max-w-md"
            />
          </Reveal>
        </div>
      </section>

      {/* About the conference */}
      <section className="section relative overflow-hidden bg-white">
        <CircuitFlow variant={2} />
        <div className="shell relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2 className="h2 mt-4">{t.aboutTitle}</h2>
            <p className="lede mt-4">{t.aboutBody}</p>
          </Reveal>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {t.highlights.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.07}>
                <article className="card h-full text-center sm:text-start">
                  <span className="text-xs font-semibold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h3 mt-2">{item.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Community benefit */}
      <section className="on-dark section relative overflow-hidden bg-navy">
        <div className="grid-veil" aria-hidden />
        <CircuitFlow variant={4} tone="dark" />
        <div
          className="glow top-1/3 start-1/2 h-96 w-96 -translate-x-1/2 bg-accent/25"
          aria-hidden
        />

        <div className="shell relative">
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/12 bg-white/[0.04] px-6 py-10 text-center backdrop-blur-xl sm:px-12">
              <p className="eyebrow justify-center">{t.benefitEyebrow}</p>
              <p className="mt-5 text-7xl font-semibold tracking-tight sm:text-8xl">
                <span className="grad-text">
                  <bdi>{t.benefitValue}</bdi>
                </span>
              </p>
              <h2 className="h2 mt-2 text-white">{t.benefitTitle}</h2>
              <p className="lede mx-auto mt-4 max-w-xl text-white/60">
                {t.benefitBody}
              </p>
              <div className="mt-8">
                <RegisterButton label={t.cta} />
                <p className="mt-3 text-sm text-white/45">{t.ctaNote}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
