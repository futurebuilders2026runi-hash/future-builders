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
  /** Initials shown in place of a photo or logo. */
  monogram: string;
  name: Record<Locale, string>;
  eyebrow: Record<Locale, string>;
  role: Record<Locale, string>;
  description: Record<Locale, string>;
  resourceName: string;
  url: string;
  cta: Record<Locale, string>;
  /**
   * A members-only benefit. Kept as structured data so a future
   * "Community benefits" area can list every partner that has one.
   */
  perk?: { value: string; label: Record<Locale, string>; code?: string };
  guestNote?: Record<Locale, string>;
};

// Partnerships announced with the club's explicit authorization. Newsletter
// details checked against LernerPython; the future visit has no scheduled date.
export const partners: ClubPartner[] = [
  {
    id: "reuven-lerner",
    monogram: "RL",
    name: { he: "ראובן לרנר", en: "Reuven Lerner" },
    eyebrow: { he: "שותף לקהילה · אורח בהמשך", en: "COMMUNITY PARTNER · FUTURE GUEST" },
    role: { he: "מדריך Python, מחבר ספרים ושותף לקהילה", en: "Python trainer, author & community partner" },
    description: {
      he: "מנה שבועית של Python: הסברים ודוגמאות שיעזרו לכתוב קוד ברור, יעיל ופייתוני יותר. הניוזלטר של ראובן נשלח בכל יום שני, באנגלית.",
      en: "A weekly dose of Python: explanations and examples to help you write clearer, more efficient, idiomatic code. Reuven's English-language newsletter arrives every Monday.",
    },
    resourceName: "Better Developers",
    url: "https://lernerpython.com/become-a-better-developer/",
    cta: { he: "להיכרות ולהרשמה לניוזלטר", en: "Explore & subscribe to the newsletter" },
    guestNote: {
      he: "ראובן יתארח בהמשך באחד ממפגשי המועדון. פרטים על המפגש יפורסמו בהמשך.",
      en: "Reuven will join us at a future club session. Session details will be announced later.",
    },
  },
  {
    id: "itay-hacmon",
    monogram: "IH",
    name: { he: "איתי חכמון", en: "Itay Hacmon" },
    eyebrow: { he: "שותף לקהילה · הטבה לחברי הקהילה", en: "COMMUNITY PARTNER · MEMBER BENEFIT" },
    role: {
      he: "מייסד Impact with AI. מומחה לבניית מערכות AI ואוטומציות, מרצה ומלווה חברות בהטמעת פתרונות AI מתקדמים.",
      en: "Founder of Impact with AI. An expert in building AI systems and automations, a lecturer, and an advisor helping companies adopt advanced AI solutions.",
    },
    description: {
      he: "במסגרת שיתוף הפעולה עם Future Builders, חברי הקהילה נהנים מהנחה בלעדית של 30% לסדנת Claude Code המעשית של איתי.",
      en: "As part of the partnership with Future Builders, community members get an exclusive 30% discount on Itay's hands-on Claude Code workshop.",
    },
    resourceName: "Impact with AI",
    url: "https://impact-with.ai/he/claude-code-workshop",
    cta: { he: "לסדנה ולהטבה", en: "To the workshop & discount" },
    perk: {
      value: "30%",
      label: { he: "הנחה לסדנת Claude Code", en: "off the Claude Code workshop" },
      code: "future-builders30",
    },
  },
];

export type CompanyPartner = {
  id: string;
  name: string;
  logo?: string;
  url?: string;
  /** Optical width within a shared, fixed-height logo area. */
  logoWidth?: number;
};

/** Add another company and its official asset here to extend the logo grid. */
export const companyPartners: CompanyPartner[] = [
  { id: "wix", name: "Wix", logo: "/partners/wix.svg", url: "https://www.wix.com/", logoWidth: 88 },
  { id: "base44", name: "Base44", logo: "/partners/base44.svg", url: "https://base44.com/", logoWidth: 140 },
  // Keep the supplied name until the company's official website is identified.
  { id: "window", name: "Window" },
  { id: "genesis", name: "Genesis", logo: "/partners/genesis.svg", url: "https://genesis-accelerator.com/", logoWidth: 140 },
  { id: "claude", name: "Claude (Anthropic)", logo: "/partners/claude.svg", url: "https://claude.com/", logoWidth: 145 },
  { id: "nvidia", name: "NVIDIA", logo: "/partners/nvidia.svg", url: "https://www.nvidia.com/", logoWidth: 145 },
];

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
  date: "2026-10-21",
  path: "/future-of-ai",
  image: "/events/future-of-ai-2026.jpg",
  /** 1200×630 link-preview image (WhatsApp, LinkedIn, X…). */
  ogImage: "/events/future-of-ai-og.jpg",
  registerUrl: "https://events.lynx.co/future-of-ai/?coupon_code=FB_AI_CLUB",
};

/**
 * Event records, including past/undated entries retained for future reuse.
 * Text for each key lives in the dictionaries under `events.items`.
 */
export type ClubEvent = {
  key: "future-of-ai" | "stripe-community" | "base44-workshop";
  image: string;
  /** Confirmed event date in Israel, YYYY-MM-DD. Undated entries stay off upcoming events. */
  date?: string;
  /** Internal page (prefixed with the locale) … */
  path?: string;
  /** … or an external site, opened in a new tab. */
  url?: string;
  /** Which side of the image to keep when a tall card crops it. Default: center. */
  focus?: "left" | "right";
  /** Square posters with text everywhere: show the whole image instead of cropping. */
  poster?: boolean;
};

export const clubEvents: ClubEvent[] = [
  // No path/url yet: registration hasn't opened, so the card shows `cta` as a status.
  { key: "base44-workshop", date: "2026-12-23", image: "/events/base44-workshop.jpg", poster: true },
  { key: "future-of-ai", date: conference.date, image: conference.ogImage, path: conference.path },
  { key: "stripe-community", image: "/events/stripe-community-tlv.jpg", url: "https://www.stripecommunity.com/", focus: "left" },
];
