import Link from "next/link";
import { CircuitCorner, Waves } from "../BrandDecor";
import { CircuitFlow } from "../CircuitFlow";
import { HeroPipeline } from "../HeroPipeline";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Hero({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { hero, stats } = dict;

  return (
    <section className="brand-sky relative overflow-hidden">
      <CircuitFlow variant={0} />
      <CircuitCorner className="end-0 top-0 opacity-70 rtl:-scale-x-100" />
      <div
        className="glow -top-24 start-[-8%] h-104 w-104 bg-accent/25"
        aria-hidden
      />
      <div
        className="glow -bottom-40 end-[-6%] h-88 w-88 bg-accent-bright/25"
        aria-hidden
      />
      <Waves className="opacity-90" />

      <div className="shell relative pb-16 pt-32 sm:pt-36 lg:pb-24 lg:pt-44">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[0.72rem] font-medium text-brand backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_2px] shadow-accent/40" />
                {hero.badge}
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="display mt-7 text-brand">
                {hero.titleLead}{" "}
                <span className="grad-text">{hero.titleAccent}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="lede mt-6 max-w-xl">{hero.body}</p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/${locale}/apply`} className="btn btn-primary">
                  {hero.primaryCta}
                </Link>
                <Link href="#program" className="btn btn-ghost">
                  {hero.secondaryCta}
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
            </Reveal>
          </div>

          <Reveal delay={0.2} y={26}>
            <HeroPipeline steps={hero.pipeline} label={hero.pipelineLabel} />
          </Reveal>
        </div>

        {/* Quick stats */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-9 border-t border-line pt-10 lg:mt-24 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.07}>
              <p className="text-3xl font-semibold tracking-tight text-brand sm:text-4xl">
                {/* isolates numeric ranges so RTL pages don't reorder them */}
                <bdi>{stat.value}</bdi>
              </p>
              <p className="mt-2 text-sm text-(--muted-fg)">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
