import { CircuitFlow } from "../CircuitFlow";
import { Reveal } from "../Reveal";
import { communityPhotos } from "@/content/config";
import type { Dict } from "@/content";

export function Community({ dict }: { dict: Dict }) {
  const { community } = dict;
  const hasPhotos = communityPhotos.length > 0;

  return (
    <section className="section relative overflow-hidden bg-cloud">
      <CircuitFlow variant={1} />
      <div className="shell relative">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{community.eyebrow}</p>
            <h2 className="h2 mt-5">{community.title}</h2>
            <p className="lede mt-5">{community.body}</p>
          </Reveal>
        </div>

        {hasPhotos ? (
          <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
            {communityPhotos.map((photo, i) => (
              <Reveal as="li" key={photo.src} delay={(i % 3) * 0.06}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="aspect-4/3 w-full rounded-xl object-cover"
                />
              </Reveal>
            ))}
          </ul>
        ) : (
          <>
            <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
              {community.tiles.map((tile, i) => (
                <Reveal as="li" key={tile} delay={(i % 3) * 0.06}>
                  <div
                    className="relative flex aspect-4/3 items-end overflow-hidden rounded-xl border border-line bg-white p-4"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-br from-accent-bright/8 via-transparent to-accent/10"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_50%_50%,#000,transparent_75%)]"
                    />
                    <span className="relative text-xs font-medium uppercase tracking-[0.16em] text-(--muted-fg)">
                      {tile}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.1}>
              <p className="mt-6 text-center text-sm text-(--muted-fg)">
                {community.emptyNote}
              </p>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
