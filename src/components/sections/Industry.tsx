import Link from "next/link";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import { partners } from "@/content/config";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Industry({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { industry } = dict;
  const hasPartners = partners.length > 0;
  const loop = hasPartners ? [...partners, ...partners] : [];

  return (
    <section id="partners" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={5} />
      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">{industry.eyebrow}</p>
            <h2 className="h2 mt-5 max-w-lg">{industry.title}</h2>
          </Reveal>

          <div className="space-y-6">
            {industry.body.map((paragraph, i) => (
              <Reveal key={i} delay={0.08 + i * 0.08}>
                <p className="lede">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Partners */}
        <Reveal delay={0.1}>
          <div className="mt-16 rounded-2xl border border-line bg-cloud px-6 py-10 lg:mt-20">
            <p className="eyebrow justify-center w-full text-center">
              {industry.partnersLabel}
            </p>

            {hasPartners ? (
              <div className="marquee-mask mt-8 overflow-hidden">
                <ul className="marquee-track items-center gap-14">
                  {loop.map((partner, i) => (
                    <li
                      key={`${partner.name}-${i}`}
                      className="shrink-0 opacity-55 grayscale transition hover:opacity-100 hover:grayscale-0"
                    >
                      {partner.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="h-8 w-auto object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-lg font-semibold tracking-tight">
                          {partner.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <p className="h3 mx-auto max-w-md">
                  {industry.partnersEmptyTitle}
                </p>
                <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-(--muted-fg)">
                  {industry.partnersEmptyBody}
                </p>
                <Link
                  href={`/${locale}/companies`}
                  className="btn btn-ghost mt-7 bg-white"
                >
                  {industry.partnersCta}
                </Link>
              </div>
            )}
          </div>
        </Reveal>

        {/* Industry sessions */}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
