import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import { leadLinks, leadPhotos } from "@/content/config";
import type { Dict } from "@/content";

/**
 * Placeholder shown until a headshot is added to `leadPhotos`. A single letter —
 * two-letter Hebrew initials read as a word rather than as initials.
 */
function initial(name: string) {
  return name.trim().charAt(0);
}

export function Leadership({ dict }: { dict: Dict }) {
  const { leadership } = dict;

  return (
    <section id="team" className="section relative overflow-hidden bg-cloud">
      <CircuitFlow variant={2} />
      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{leadership.eyebrow}</p>
            <h2 className="h2 mt-5">{leadership.title}</h2>
            <p className="lede mt-5">{leadership.body}</p>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {leadership.people.map((person, i) => {
            const photo = leadPhotos[person.key];
            const link = leadLinks[person.key];

            return (
              <Reveal as="li" key={person.key} delay={i * 0.08}>
                <article className="card flex h-full flex-col gap-6 sm:flex-row sm:items-start">
                  <span className="shrink-0">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={person.name}
                        loading="lazy"
                        className="h-28 w-28 rounded-2xl object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="grid h-28 w-28 place-items-center rounded-2xl bg-linear-to-br from-accent-bright/25 to-accent/20 text-3xl font-semibold text-brand"
                      >
                        {initial(person.name)}
                      </span>
                    )}
                  </span>

                  <div className="min-w-0">
                    <h3 className="h3 text-brand">{person.name}</h3>
                    {person.bio && (
                      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                        {person.bio}
                      </p>
                    )}
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {leadership.linkedin}
                      </a>
                    )}
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
