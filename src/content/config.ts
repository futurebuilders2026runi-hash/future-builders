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

export type ClubPartner = {
  id: string;
  name: Record<Locale, string>;
  role: Record<Locale, string>;
  description: Record<Locale, string>;
  resourceName: string;
  url: string;
  guestNote: Record<Locale, string>;
};

// Partnerships announced with the club's explicit authorization. Newsletter
// details checked against LernerPython; the future visit has no scheduled date.
export const partners: ClubPartner[] = [{
  id: "reuven-lerner",
  name: { he: "ראובן לרנר", en: "Reuven Lerner" },
  role: { he: "מדריך Python, מחבר ספרים ושותף לקהילה", en: "Python trainer, author & community partner" },
  description: {
    he: "מנה שבועית של Python: הסברים ודוגמאות שיעזרו לכתוב קוד ברור, יעיל ופייתוני יותר. הניוזלטר של ראובן נשלח בכל יום שני, באנגלית.",
    en: "A weekly dose of Python: explanations and examples to help you write clearer, more efficient, idiomatic code. Reuven's English-language newsletter arrives every Monday.",
  },
  resourceName: "Better Developers",
  url: "https://lernerpython.com/become-a-better-developer/",
  guestNote: {
    he: "ראובן יתארח בהמשך באחד ממפגשי המועדון. פרטים על המפגש יפורסמו בהמשך.",
    en: "Reuven will join us at a future club session. Session details will be announced later.",
  },
}];

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
  /** 1200×630 link-preview image (WhatsApp, LinkedIn, X…). */
  ogImage: "/events/future-of-ai-og.jpg",
  registerUrl: "https://events.lynx.co/future-of-ai/?coupon_code=FB_AI_CLUB",
};

/**
 * Cards in the home page "Upcoming events" section, in display order. Text for
 * each key lives in the dictionaries under `events.items`.
 */
export const upcomingEvents = [
  { key: "future-of-ai", image: conference.ogImage, path: conference.path },
] as const;
