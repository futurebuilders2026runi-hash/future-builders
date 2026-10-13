import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import type { Dict } from "@/content";

export function About({ dict }: { dict: Dict }) {
  const { about } = dict;

  return (
    <section id="about" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={1} />
      <div className="shell relative">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <Reveal>
            <p className="eyebrow">{about.eyebrow}</p>
            <h2 className="h2 mt-3">{about.title}</h2>
          </Reveal>

          <div>
            <div className="space-y-4">
              {about.body.map((paragraph, i) => (
                <Reveal key={i} delay={0.08 + i * 0.08}>
                  <p className="lede">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.28}>
              <div className="mt-6 rounded-2xl border border-line bg-cloud p-5">
                <p className="eyebrow">{about.goalLabel}</p>
                <p className="h3 mx-auto mt-3 max-w-lg md:mx-0">{about.goal}</p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1}>
          <figure className="mt-6 border-t border-line pt-6 text-center lg:mt-8">
            <blockquote className="h1 mx-auto max-w-3xl">
              <span className="grad-text">{about.pull.quote}</span>
            </blockquote>
            <figcaption className="mt-3 text-sm text-(--muted-fg)">
              {about.pull.caption}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
