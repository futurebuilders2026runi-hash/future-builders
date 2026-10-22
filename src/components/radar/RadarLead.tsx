import Link from "next/link";
import type { Locale } from "@/content/config";
import { radarCopy } from "@/content/radar";
import type { News } from "@/lib/radar/schema";
import { displayDate } from "@/lib/radar/domain";
import { radarTextDirection } from "@/lib/radar/presentation";
import { RadarArtwork } from "./RadarArtwork";

export function RadarLead({ story, sideStories, locale }: {
  story: News;
  sideStories: News[];
  locale: Locale;
}) {
  const t = radarCopy[locale];
  return (
    <section className="shell radar-lead-grid" aria-label={t.featuredStory}>
      <article className="radar-lead-story">
        <RadarArtwork item={story} locale={locale} variant="feature" priority />
        <div className="radar-lead-scrim" />
        <div className="radar-lead-content">
          <span className="radar-pick-label"><span aria-hidden>✦</span> {story.featured ? t.editorialPick : t.interesting}</span>
          <p className="radar-lead-meta"><bdi>{story.sourceName}</bdi><span>·</span><time dateTime={story.publishedAt}>{displayDate(story.publishedAt, locale)}</time></p>
          <h2 dir={radarTextDirection(story.title[locale])}><Link href={`/${locale}/ai-radar/news/${story.id}`}>{story.title[locale]}</Link></h2>
          <p className="radar-lead-summary">{story.summary[locale]}</p>
          <Link href={`/${locale}/ai-radar/news/${story.id}`} className="radar-lead-cta">
            {t.storyLink}<span aria-hidden>{locale === "he" ? "↖" : "↗"}</span>
          </Link>
        </div>
      </article>
      <aside className="radar-side-stories">
        <div className="radar-side-heading"><span className="radar-live-dot" />{t.onOurRadar}<span aria-hidden>↗</span></div>
        {sideStories.map((item, index) => (
          <article key={item.id} className="radar-side-story">
            <Link href={`/${locale}/ai-radar/news/${item.id}`} className="radar-side-art" tabIndex={-1} aria-hidden="true">
              <RadarArtwork item={item} locale={locale} variant="small" />
            </Link>
            <div className="radar-side-copy">
              <span className="radar-side-number" aria-hidden>0{index + 2}</span>
              <p className="radar-side-meta"><bdi>{item.sourceName}</bdi> · {displayDate(item.publishedAt, locale)}</p>
              <h3 dir={radarTextDirection(item.title[locale])}><Link href={`/${locale}/ai-radar/news/${item.id}`}>{item.title[locale]}</Link></h3>
              <Link className="radar-side-link" href={`/${locale}/ai-radar/news/${item.id}`} aria-label={`${t.details}: ${item.title[locale]}`}><span aria-hidden>↗</span></Link>
            </div>
          </article>
        ))}
      </aside>
    </section>
  );
}
