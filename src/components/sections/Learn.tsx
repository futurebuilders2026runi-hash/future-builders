import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";

export function Learn({ dict }: { dict: Dict }) {
  const { learn } = dict;

  return (
    <section id="learn" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={3} />
      <div className="shell relative">
        <div className="mx-auto max-w-2xl md:mx-0">
          <Reveal>
            <p className="eyebrow">{learn.eyebrow}</p>
            <h2 className="h2 mt-3">{learn.title}</h2>
            <p className="lede mt-3">{learn.body}</p>
          </Reveal>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {learn.cards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={(i % 3) * 0.06}>
              <article className="card group h-full">
                <div className="flex items-baseline justify-center gap-3 sm:block">
                  <span className="text-xs font-semibold tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h3 sm:mt-3">{card.title}</h3>
                </div>
                <p className="mt-2 text-[0.9375rem] sm:mt-2.5 leading-relaxed text-(--muted-fg)">
                  {card.body}
                </p>
                <span
                  aria-hidden
                  className="mx-auto mt-4 hidden h-px w-10 sm:block md:mx-0 origin-[left_center] bg-linear-to-r from-accent-bright to-accent transition-all duration-500 group-hover:w-20 rtl:origin-[right_center]"
                />
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
