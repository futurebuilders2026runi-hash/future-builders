import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import { projects } from "@/content/config";
import type { Dict } from "@/content";

export function Projects({ dict }: { dict: Dict }) {
  const { projects: copy } = dict;
  const hasProjects = projects.length > 0;

  return (
    <section id="projects" className="section relative overflow-hidden bg-white">
      <CircuitFlow variant={5} />
      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="h2 mt-5">{copy.title}</h2>
            <p className="lede mt-5">{copy.body}</p>
          </Reveal>
        </div>

        {hasProjects ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal as="li" key={project.slug} delay={(i % 3) * 0.06}>
                <article className="card h-full overflow-hidden p-0">
                  <div className="aspect-16/10 w-full bg-mist">
                    {project.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.image}
                        alt={project.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="h3">{project.name}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-(--muted-fg)">
                      {project.summary}
                    </p>

                    <p className="mt-4 text-xs text-(--muted-fg)">
                      <span className="font-medium">{copy.teamLabel}:</span>{" "}
                      {project.team.join(", ")}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5" dir="ltr">
                      {[project.model, ...project.stack]
                        .filter(Boolean)
                        .map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-line px-2.5 py-1 text-[0.7rem] text-(--muted-fg)"
                          >
                            {tech}
                          </li>
                        ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
                      {project.siteUrl && (
                        <a
                          href={project.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          {copy.viewProject}
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          {copy.demo}
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          {copy.code}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal delay={0.12}>
            <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
              <span
                aria-hidden
                className="mb-6 grid h-12 w-12 place-items-center rounded-full border border-line"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-linear-to-br from-accent-bright to-accent" />
              </span>
              <p className="h3 max-w-md">{copy.emptyTitle}</p>
              <p className="mt-3 text-[0.9375rem] text-(--muted-fg)">
                {copy.emptyBody}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
