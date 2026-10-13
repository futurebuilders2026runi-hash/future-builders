import Link from "next/link";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Who({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { who, selection } = dict;

  return (
    <section id="apply-info" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={3} />
      <div className="shell relative">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">{who.eyebrow}</p>
            <h2 className="h2 mt-5">{who.title}</h2>
            <p className="lede mt-5">{who.body}</p>
          </Reveal>

          <ul className="space-y-3">
            {who.items.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 0.05}>
                <span className="flex items-start gap-3.5 border-b border-line pb-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className="mt-1 shrink-0"
                  >
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 5"
                      stroke="url(#fb-check)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="fb-check" x1="3" y1="5" x2="13" y2="12">
                        <stop offset="0%" stopColor="#3EC8F4" />
                        <stop offset="100%" stopColor="#8F6FFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-[0.9375rem] leading-relaxed">{item}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <p className="h1 mx-auto mt-14 max-w-3xl text-center lg:mt-16">
            <span className="grad-text">{who.pull}</span>
          </p>
        </Reveal>

        {/* Selection process */}
        <div className="mt-14 border-t border-line pt-10 lg:mt-16">
          <Reveal>
            <p className="eyebrow">{selection.eyebrow}</p>
            <h2 className="h2 mt-5">{selection.title}</h2>
          </Reveal>

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {selection.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.08}>
                <article className="card h-full">
                  <div className="flex items-baseline gap-3 md:block">
                    <span className="text-xs font-semibold tabular-nums text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="h3 md:mt-3">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                    {step.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.12}>
            <div className="mt-10">
              <Link href={`/${locale}/apply`} className="btn btn-primary w-full sm:w-auto">
                {selection.cta}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
