import Link from "next/link";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";
import { getUpcomingEvents } from "@/lib/events";

export function Events({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { events } = dict;
  const upcomingEvents = getUpcomingEvents();

  if (upcomingEvents.length === 0) return null;

  return (
    <section id="events" className="section relative overflow-hidden bg-cloud">
      <CircuitFlow variant={0} />
      <div className="shell relative">
        <Reveal>
          <p className="eyebrow">{events.eyebrow}</p>
          <h2 className="h2 mt-3">{events.title}</h2>
        </Reveal>

        <ul className="mt-6 grid gap-5">
          {upcomingEvents.map((event, i) => {
            const t = events.items[event.key];
            const href = event.url ?? (event.path ? `/${locale}${event.path}` : null);
            const image = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.image}
                alt={t.imageAlt}
                width={event.poster ? 1000 : 1200}
                height={event.poster ? 1000 : 630}
                loading="lazy"
                className={
                  event.poster
                    ? "aspect-square h-full w-full object-contain"
                    : `aspect-[1200/630] h-full w-full object-cover md:aspect-auto ${
                        event.focus === "left" ? "object-left" : event.focus === "right" ? "object-right" : ""
                      }`
                }
              />
            );

            return (
              <Reveal as="li" key={event.key} delay={i * 0.08}>
                {/* Image first: on the right in Hebrew, on the left in English */}
                <article
                  className={`grid overflow-hidden rounded-3xl border border-line bg-white shadow-[0_30px_60px_-44px_rgb(11_42_107/0.45)] ${
                    event.poster ? "md:grid-cols-[0.9fr_1.1fr]" : "md:grid-cols-[1.1fr_1fr]"
                  }`}
                >
                  {href ? (
                    <CardLink href={href} external={!!event.url} tabIndex={-1} className="block bg-ink">
                      {image}
                    </CardLink>
                  ) : (
                    <div className="bg-ink">{image}</div>
                  )}

                  <div className="flex flex-col p-5 text-center sm:p-7 md:text-start">
                    <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-line bg-cloud px-3 py-1 text-xs font-medium text-brand md:mx-0">
                      {t.badge}
                    </span>

                    <h3 className="h2 mt-4 text-brand">
                      <bdi>{t.title}</bdi>
                    </h3>
                    {t.tagline && (
                      <p className="mt-2 text-base font-medium text-brand/80">{t.tagline}</p>
                    )}

                    {(t.date || t.venue) && (
                      <ul className="mt-4 flex flex-col items-center gap-2 text-sm font-medium text-brand sm:flex-row sm:justify-center sm:gap-5 md:justify-start">
                        {t.date && (
                          <li className="flex items-center gap-2">
                            <CalendarIcon />
                            <time dateTime={event.date}><bdi>{t.date}</bdi></time>
                          </li>
                        )}
                        {t.venue && (
                          <li className="flex items-center gap-2">
                            <PinIcon />
                            {t.venue}
                          </li>
                        )}
                      </ul>
                    )}

                    <div className="mt-4 space-y-3">
                      {t.body.map((paragraph) => (
                        <p key={paragraph} className="text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {t.perk && (
                      <p className="mt-4 text-sm font-semibold">
                        <span className="grad-text">{t.perk}</span>
                      </p>
                    )}

                    {t.details.length > 0 && (
                      <dl className="mt-4 space-y-1.5 rounded-2xl border border-line bg-cloud px-4 py-3 text-start text-sm">
                        {t.details.map((detail: { label: string; value: string }) => (
                          <div key={detail.label}>
                            <dt className="inline font-semibold text-brand">{detail.label}: </dt>
                            <dd className="inline text-(--muted-fg)">{detail.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <div className="mt-6 md:mt-auto md:pt-6">
                      {href ? (
                        <CardLink href={href} external={!!event.url} className="btn btn-primary w-full sm:w-auto">
                          {t.cta}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            aria-hidden
                            className="rtl:-scale-x-100"
                          >
                            <path
                              d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </CardLink>
                      ) : (
                        <p className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-accent/40 bg-accent/5 px-5 py-3 text-sm font-semibold text-brand sm:w-auto">
                          {t.cta}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Internal pages use client-side navigation; external sites open in a new tab. */
function CardLink({
  href,
  external,
  ...props
}: { href: string; external: boolean; className?: string; tabIndex?: number; children: React.ReactNode }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  ) : (
    <Link href={href} {...props} />
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-accent">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-accent">
      <path
        d="M8 14.5s4.5-4.2 4.5-8a4.5 4.5 0 1 0-9 0c0 3.8 4.5 8 4.5 8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
