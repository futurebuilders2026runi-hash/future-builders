import Link from "next/link";
import type { Dict } from "@/content";
import { conference, type Locale } from "@/content/config";

/** Slim home-page strip pointing to the Future of AI 2026 conference page. */
export function ConferenceBanner({ locale, dict }: { locale: Locale; dict: Dict }) {
  const { banner } = dict.conference;

  return (
    <div className="bg-white pt-6">
      <div className="shell">
        <Link
          href={`/${locale}${conference.path}`}
          className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-linear-to-r from-ink via-navy to-navy-soft px-5 py-4 text-center text-white shadow-[0_20px_40px_-28px_rgb(11_42_107/0.7)] transition-shadow hover:shadow-[0_26px_50px_-26px_rgb(11_42_107/0.8)] sm:flex-row sm:gap-4 sm:text-start"
        >
          <span
            aria-hidden
            className="glow -top-16 end-[-4rem] h-40 w-40 bg-accent-bright/30"
          />
          <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-bright shadow-[0_0_10px_2px] shadow-accent-bright/50" />
            <bdi>{banner.badge}</bdi>
          </span>
          <span className="relative text-sm text-white/80 sm:flex-1">{banner.text}</span>
          <span className="relative inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-bright">
            {banner.link}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
            >
              <path
                d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
