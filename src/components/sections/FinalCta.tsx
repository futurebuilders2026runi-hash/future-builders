import Link from "next/link";
import { Waves } from "../BrandDecor";
import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function FinalCta({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { finalCta } = dict;

  return (
    <section className="on-dark relative overflow-hidden bg-ink">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_120%,#173a86_0%,#0a2050_50%,#061635_100%)]"
      />
      <div className="grid-veil" aria-hidden />
      <CircuitFlow variant={4} tone="dark" />
      <div
        className="glow bottom-[-14rem] start-1/2 h-120 w-120 -translate-x-1/2 bg-accent/30"
        aria-hidden
      />
      <Waves tone="dark" className="opacity-60" />

      <div className="shell relative py-10 text-center lg:py-12">
        <Reveal>
          <h2 className="display text-white">{finalCta.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede mx-auto mt-4 max-w-lg text-white/60">
            {finalCta.body}
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href={`/${locale}/apply`} className="btn btn-primary">
              {finalCta.primary}
            </Link>
            <Link href={`/${locale}/companies`} className="btn btn-ghost">
              {finalCta.secondary}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
