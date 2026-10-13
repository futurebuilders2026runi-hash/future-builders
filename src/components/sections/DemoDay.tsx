import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";

export function DemoDay({ dict }: { dict: Dict }) {
  const { demoDay } = dict;

  return (
    <section className="on-dark section relative overflow-hidden bg-ink">
      <div className="grid-veil" aria-hidden />
      <CircuitFlow variant={2} tone="dark" />
      <div
        className="glow bottom-[-8rem] end-[10%] h-[20rem] w-[20rem] bg-accent-bright/25"
        aria-hidden
      />

      <div className="shell relative grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10">
        <Reveal>
          <p className="eyebrow">{demoDay.eyebrow}</p>
          <h2 className="h1 mt-3 text-white">{demoDay.title}</h2>
          <p className="lede mx-auto mt-4 max-w-lg text-white/55 md:mx-0">{demoDay.body}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <p className="eyebrow">{demoDay.itemsLabel}</p>
            <ol className="mt-4 space-y-3">
              {demoDay.items.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center justify-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 md:justify-start"
                >
                  <span className="text-[0.7rem] font-semibold tabular-nums text-accent-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-white/85">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
