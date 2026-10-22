import Link from "next/link";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import { partners } from "@/content/config";
import { PartnerCard } from "../PartnerCard";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Industry({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { industry } = dict;
  const hasPartners = partners.length > 0;

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
          <div className="mt-6 rounded-2xl border border-line bg-cloud px-4 py-5 lg:mt-6">
            <p className="eyebrow justify-center w-full text-center">
              {industry.partnersLabel}
            </p>

            {hasPartners ? (
              <div className="mt-5 grid gap-4">
                {partners.map((partner) => <PartnerCard key={partner.id} partner={partner} locale={locale} />)}
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="h3 mx-auto max-w-md">
                  {industry.partnersEmptyTitle}
                </p>
                <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-(--muted-fg)">
                  {industry.partnersEmptyBody}
                </p>
                <Link
                  href={`/${locale}/companies`}
                  className="btn btn-ghost mt-4 bg-white"
                >
                  {industry.partnersCta}
                </Link>
              </div>
            )}
          </div>
        </Reveal>

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
