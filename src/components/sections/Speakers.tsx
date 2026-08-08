"use client";

import { useState } from "react";
import { Reveal } from "../Reveal";
import { speakers, type Speaker } from "@/content/config";
import type { Dict } from "@/content";

type Track = Speaker["tracks"][number];
const TRACKS: Track[] = ["ai", "engineering", "product", "entrepreneurship"];

/** Renders nothing until speakers are added to src/content/config.ts. */
export function Speakers({ dict }: { dict: Dict }) {
  const [filter, setFilter] = useState<Track | "all">("all");

  if (speakers.length === 0) return null;

  const { speakers: copy } = dict;
  const visible =
    filter === "all"
      ? speakers
      : speakers.filter((s) => s.tracks.includes(filter));

  const chips: { key: Track | "all"; label: string }[] = [
    { key: "all", label: copy.filters.all },
    ...TRACKS.map((track) => ({ key: track, label: copy.filters[track] })),
  ];

  return (
    <section id="speakers" className="section bg-white">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="h2 mt-5 max-w-2xl">{copy.title}</h2>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              aria-pressed={filter === chip.key}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                filter === chip.key
                  ? "border-transparent bg-brand text-white"
                  : "border-line text-(--muted-fg) hover:border-accent/40 hover:text-(--page-fg)"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((speaker) => (
            <li key={`${speaker.name}-${speaker.company}`}>
              <article className="card h-full">
                <div className="mb-5 aspect-square w-full overflow-hidden rounded-xl bg-mist">
                  {speaker.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photo}
                      alt={speaker.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-base font-semibold tracking-tight">
                  {speaker.name}
                </h3>
                <p className="mt-1 text-sm text-(--muted-fg)">
                  {speaker.role} · {speaker.company}
                </p>
                <p className="mt-3 text-[0.8125rem] text-(--muted-fg)">
                  {speaker.session}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
