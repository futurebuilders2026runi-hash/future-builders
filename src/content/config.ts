export const locales = ["he", "en"] as const;

export type Locale = (typeof locales)[number];

/** Hebrew is the primary site; English is the secondary translation. */
export const defaultLocale: Locale = "he";

export const dirFor = (locale: Locale): "ltr" | "rtl" =>
  locale === "he" ? "rtl" : "ltr";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/**
 * Contact + social details. Update these once the club's accounts are live —
 * every link in the site reads from here.
 */
export const contact = {
  email: "futurebuilders@post.runi.ac.il",
  whatsapp: "https://wa.me/972587878676",
  linkedin: "https://www.linkedin.com/",
  instagram: "https://www.instagram.com/",
  siteUrl: "https://futurebuilders.ai",
};

/**
 * Partner companies. IMPORTANT: only add a company here once the collaboration
 * is signed AND they have approved use of their name and logo. While this list
 * is empty the site shows a neutral "partners announced soon" state instead.
 *
 * logo: path to an SVG/PNG inside /public/partners (optional — falls back to the
 * company name set in type).
 */
export const partners: { name: string; logo?: string; url?: string }[] = [];

/**
 * Student projects. Empty until the first cohort ships — the Projects section
 * renders a "coming soon" state while there is nothing here.
 */
export type Project = {
  slug: string;
  name: string;
  summary: string;
  team: string[];
  stack: string[];
  model?: string;
  image?: string;
  demoUrl?: string;
  repoUrl?: string;
  siteUrl?: string;
};

export const projects: Project[] = [];

/**
 * Headshots for the people running the club, keyed by the `key` used in the
 * dictionaries. Drop the files in /public/team and point at them here — while a
 * key is missing the card falls back to the person's initials.
 *
 *   leadPhotos = { lia: "/team/lia.jpg", shoham: "/team/shoham.jpg" }
 */
export const leadPhotos: Record<string, string> = {
  lia: "/team/lia.jpg",
  shoham: "/team/shoham.jpg",
};

/** Optional LinkedIn profiles for the same people, same keys. */
export const leadLinks: Record<string, string> = {};

/**
 * Community photos (paths inside /public). While empty, the Community section
 * shows labelled placeholder tiles instead of a photo collage.
 */
export const communityPhotos: { src: string; alt: string }[] = [];

/**
 * Speakers and mentors. The Speakers section is hidden entirely while empty.
 */
export type Speaker = {
  name: string;
  role: string;
  company: string;
  session: string;
  photo?: string;
  tracks: ("ai" | "engineering" | "product" | "entrepreneurship")[];
};

export const speakers: Speaker[] = [];

/**
 * Future of AI 2026 conference page (/[lang]/future-of-ai). The registration
 * URL carries the community discount code — keep the query string intact.
 */
export const conference = {
  path: "/future-of-ai",
  image: "/events/future-of-ai-2026.jpg",
  registerUrl: "https://events.lynx.co/future-of-ai/?coupon_code=FB_AI_CLUB",
};
