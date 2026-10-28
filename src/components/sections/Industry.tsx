import Link from "next/link";
import { Reveal } from "../Reveal";
import { companyPartners, partners } from "@/content/config";
import { PartnerCard } from "../PartnerCard";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Industry({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { industry } = dict;

  return (
    <section id="partners" className="section border-b border-line bg-white" aria-labelledby="industry-title">
      <div className="shell text-start">
        <div className="grid gap-4 md:grid-cols-2 md:items-end md:gap-12">
          <Reveal>
            <p className="text-xs font-medium text-(--muted-fg)">{industry.eyebrow}</p>
            <h2 id="industry-title" className="h2 mt-3">{industry.title}</h2>
          </Reveal>

          <div className="space-y-4">
            {industry.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08 + i * 0.08}>
                <p className="text-base leading-7 text-(--muted-fg)">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Partners */}
        <Reveal delay={0.1}>
          <div className="partner-showcase mt-8">
            <p className="text-sm text-(--muted-fg)">
              {industry.partnersLabel}
            </p>
            <ul className="partner-logo-grid mt-3 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-line py-4 md:grid-cols-3 lg:grid-cols-6" aria-label={industry.partnersLabel}>
              {companyPartners.map((partner) => {
                const logo = partner.logo ? (
                  // Official logos retain their own colors and proportions.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partner.logo} alt={partner.name} width={partner.logoWidth ?? 140} height={48} loading="lazy" decoding="async" style={{ width: partner.logoWidth ?? 140 }} />
                ) : (
                  <span className="text-xl font-medium text-ink" dir="ltr">{partner.name}</span>
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-(--muted-fg)">{industry.partnersMore}</p>
              <Link href={`/${locale}/companies`} className="text-sm font-medium text-accent underline underline-offset-4">{industry.partnersCta}</Link>
            </div>
          </div>
        </Reveal>

        {/* Industry sessions */}
        <ul className="my-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {industry.sessions.map((session, i) => (
            <Reveal as="li" key={session.title} delay={i * 0.06}>
              <article>
                <h3 className="text-sm font-medium text-brand">{session.title}</h3>
                <p className="mt-2 text-sm leading-6 text-(--muted-fg)">
                  {session.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>

        {partners.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-2 text-base font-medium text-brand">{industry.communityLabel}</h3>
            {partners.map((partner) => (
              <Reveal key={partner.id}><PartnerCard partner={partner} locale={locale} /></Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
