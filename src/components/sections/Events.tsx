import Link from "next/link";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";
import { upcomingEvents, type Locale } from "@/content/config";

export function Events({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { events } = dict;

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
            const href = `/${locale}${event.path}`;

            return (
              <Reveal as="li" key={event.key} delay={i * 0.08}>
                {/* Image first: on the right in Hebrew, on the left in English */}
                <article className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-[0_30px_60px_-44px_rgb(11_42_107/0.45)] md:grid-cols-[1.1fr_1fr]">
                  <Link href={href} tabIndex={-1} className="block bg-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image}
                      alt={t.imageAlt}
                      width={1200}
                      height={630}
                      loading="lazy"
                      className="aspect-[1200/630] h-full w-full object-cover md:aspect-auto"
                    />
                  </Link>

                  <div className="flex flex-col p-5 text-center sm:p-7 md:text-start">
                    <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-line bg-cloud px-3 py-1 text-xs font-medium text-brand md:mx-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_2px] shadow-accent/40" />
                      {t.badge}
                    </span>

                    <h3 className="h2 mt-4 text-brand">
                      <bdi>{t.title}</bdi>
                    </h3>

                    <ul className="mt-4 flex flex-col items-center gap-2 text-sm font-medium text-brand sm:flex-row sm:justify-center sm:gap-5 md:justify-start">
                      <li className="flex items-center gap-2">
                        <CalendarIcon />
                        <bdi>{t.date}</bdi>
                      </li>
                      <li className="flex items-center gap-2">
                        <PinIcon />
                        {t.venue}
                      </li>
                    </ul>

                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                      {t.body}
                    </p>

                    <p className="mt-4 text-sm font-semibold">
                      <span className="grad-text">{t.perk}</span>
                    </p>

                    <div className="mt-6 md:mt-auto md:pt-6">
                      <Link href={href} className="btn btn-primary w-full sm:w-auto">
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
                      </Link>
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
