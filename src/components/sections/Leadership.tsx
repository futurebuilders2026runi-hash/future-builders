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
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow">{leadership.eyebrow}</p>
            <h2 className="h2 mt-5">{leadership.title}</h2>
            <p className="lede mt-5">{leadership.body}</p>
          </Reveal>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
          {leadership.people.map((person, i) => {
            const photo = leadPhotos[person.key];
            const link = leadLinks[person.key];

            return (
              <Reveal as="li" key={person.key} delay={i * 0.08}>
                <article className="card flex h-full flex-col items-center gap-6 text-center sm:p-8">
                  <span className="shrink-0">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={person.name}
                        loading="lazy"
                        className="h-52 w-52 rounded-3xl object-cover shadow-[0_24px_48px_-28px_rgb(11_42_107/0.45)] sm:h-60 sm:w-60"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="grid h-52 w-52 place-items-center rounded-3xl sm:h-60 sm:w-60 bg-linear-to-br from-accent-bright/25 to-accent/20 text-5xl font-semibold text-brand"
                      >
                        {initial(person.name)}
                      </span>
                    )}
                  </span>

                  <div className="min-w-0">
                    <h3 className="h3 text-brand">{person.name}</h3>
                    {person.role && (
                      <p dir="ltr" className="mt-1 text-sm font-medium text-accent">
                        {person.role}
                      </p>
                    )}
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
