import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";

export function Learn({ dict }: { dict: Dict }) {
  const { learn } = dict;

  return (
    <section id="learn" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={3} />
      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{learn.eyebrow}</p>
            <h2 className="h2 mt-5">{learn.title}</h2>
            <p className="lede mt-5">{learn.body}</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {learn.cards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={(i % 3) * 0.06}>
              <article className="card group h-full">
                <span className="text-xs font-semibold tabular-nums text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="h3 mt-3">{card.title}</h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                  {card.body}
                </p>
                <span
                  aria-hidden
                  className="mt-6 block h-px w-10 origin-[left_center] bg-linear-to-r from-accent-bright to-accent transition-all duration-500 group-hover:w-20 rtl:origin-[right_center]"
                />
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
