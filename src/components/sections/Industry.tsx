import Link from "next/link";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import { companyPartners, partners } from "@/content/config";
import { PartnerCard } from "../PartnerCard";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Industry({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { industry } = dict;

  return (
    <section id="partners" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={5} />
      <div className="shell relative">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
          <Reveal>
            <p className="eyebrow">{industry.eyebrow}</p>
            <h2 className="h2 mx-auto mt-3 max-w-lg md:mx-0">{industry.title}</h2>
          </Reveal>

          <div className="space-y-4">
            {industry.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08 + i * 0.08}>
                <p className="lede">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Partners */}
        <Reveal delay={0.1}>
          <div className="partner-showcase mt-7 rounded-3xl border border-line bg-cloud p-4 sm:p-6 lg:p-8">
            <p className="eyebrow w-full justify-center text-center">
              {industry.partnersLabel}
            </p>
            <ul className="partner-logo-grid mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6" aria-label={industry.partnersLabel}>
              {companyPartners.map((partner) => {
                const logo = partner.logo ? (
                  // Official logos retain their own colors and proportions.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partner.logo} alt={partner.name} width={partner.logoWidth ?? 140} height={48} loading="lazy" decoding="async" style={{ width: partner.logoWidth ?? 140 }} />
                ) : (
                  <span className="text-2xl font-semibold tracking-tight text-ink" dir="ltr">{partner.name}</span>
                );
                return (
                  <li key={partner.id} className="min-w-0">
                    {partner.url ? (
                      <a href={partner.url} target="_blank" rel="noopener noreferrer" className="partner-logo-tile" aria-label={partner.name}>{logo}</a>
                    ) : (
                      <div className="partner-logo-tile">{logo}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-start">
              <p className="text-sm text-(--muted-fg)">{industry.partnersMore}</p>
              <Link href={`/${locale}/companies`} className="text-sm font-medium text-accent underline-offset-4 hover:underline">{industry.partnersCta}<span className="ms-2" aria-hidden>↗</span></Link>
            </div>
          </div>
        </Reveal>

        {partners.length > 0 && (
          <div className="mt-5 grid gap-4">
            {partners.map((partner) => (
              <Reveal key={partner.id}><PartnerCard partner={partner} locale={locale} /></Reveal>
            ))}
          </div>
        )}

        {/* Industry sessions */}
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {industry.sessions.map((session, i) => (
            <Reveal as="li" key={session.title} delay={i * 0.06}>
              <article className="card h-full">
                <h3 className="h3">{session.title}</h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                  {session.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
