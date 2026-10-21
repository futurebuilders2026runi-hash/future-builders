# Future Builders — website

Marketing site for Future Builders, the AI club at Reichman University.
Hebrew-first with full RTL, an English translation alongside it, mobile-first,
built to grow from a one-pager into a multi-page site.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · TypeScript

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /he
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Routes

| Path             | What it is                                                  |
| ---------------- | ----------------------------------------------------------- |
| `/he`, `/en`     | Home — every section from the spec, one page                 |
| `/*/apply`       | Application page + form                                      |
| `/*/admin`       | Password-protected registration inbox                        |
| `/*/companies`   | For Companies page + partnership form                        |
| `/api/apply`     | Application submissions (POST)                               |
| `/api/admin/login`, `/api/admin/logout` | Admin session (POST)                 |
| `/api/admin/applications` | Registrations (GET, admin session required)          |
| `/api/partner`   | Partnership submissions (POST)                               |
| `/sitemap.xml`, `/robots.txt` | Generated, both locales                        |

**Hebrew is the primary site.** `/` redirects to `/he`; only browsers that ask
for English without Hebrew land on `/en` ([src/proxy.ts](src/proxy.ts)).

---

## Editing content

**All copy lives in two files** — no text is hard-coded in components:

- [src/content/en.ts](src/content/en.ts) — English (also defines the `Dict` type)
- [src/content/he.ts](src/content/he.ts) — Hebrew (must match the same shape;
  TypeScript will tell you if a key is missing)

Structural data lives in [src/content/config.ts](src/content/config.ts):

| Export             | Effect on the site                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `contact`          | Email, LinkedIn, Instagram and the canonical site URL used by SEO tags                                |
| `partners`         | **Empty by design.** While empty the Partners block shows "partners being confirmed". Add a company only once the collaboration is signed and they have approved use of their name/logo. |
| `projects`         | Empty → Projects shows the "first products are being built" state. Add entries and the grid appears.   |
| `communityPhotos`  | Empty → labelled placeholder tiles. Add photos (in `/public`) and they become a collage.               |
| `speakers`         | Empty → the Speakers section is hidden entirely. Add people and it appears with track filters.         |

Partner logos go in `public/partners/`, photos anywhere under `public/`.

### What stays in English on the Hebrew site

Only the **The build path** panel and its contents (Idea → Research → Product →
AI → Build → POC). It is `dir="ltr"` as a whole
([HeroPipeline.tsx](src/components/HeroPipeline.tsx)).

Everything else is Hebrew — including the hero headline — apart from the brand
name and the industry acronyms Israeli tech uses untranslated anyway (AI, POC,
MVP, PRD, MRD, RAG, UX, Demo Day).

### Hebrew copy note

Where a Latin word is followed by a period **mid-sentence**, the Hebrew strings
carry an invisible LRM (`U+200E`) after the period so bidi doesn't flip it
(e.g. `לא רק ללמוד AI.‎ לבנות איתו.`). Number ranges use a plain hyphen
(`30-40`) rather than an en dash for the same reason.

---

## Form submissions

The registration form collects first name, last name, one of four Computer
Science tracks, year 2 or 3, phone, email, motivation, background, and an optional
AI introduction. The same field validation runs in the browser and on the server.

Registrations are saved to Supabase before the form confirms success. In local
development without Supabase, records persist in `.data/applications.jsonl`,
which is ignored by Git. **Production requires Supabase; the server returns an
error rather than silently logging or losing a registration.** The partnership
form retains its original delivery configuration.

Before deploying:

1. Run [supabase/applications.sql](supabase/applications.sql) in the Supabase SQL
   editor to create or update the table. This also restricts public access.
2. Set the server-only environment variables shown in `.env.example`.
3. Open `/he/admin` (or `/en/admin`) and sign in with `ADMIN_PASSWORD`.

The admin page lists all registrations, newest first, with expandable details.
It requires a signed, HttpOnly session cookie that expires after eight hours;
the registrations API checks the same session. Changing the password or session
secret invalidates existing sessions. No admin page is included in the sitemap.

```bash
# .env.local

# Required for production registration storage.
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=…                  # server-side only, never NEXT_PUBLIC_
# SUPABASE_SERVICE_ROLE_KEY=…          # alternative for an existing legacy key
ADMIN_PASSWORD=…                       # at least 12 characters
ADMIN_SESSION_SECRET=…                 # random secret, at least 32 characters

# Optional registration notification / partnership delivery.
SUBMISSIONS_WEBHOOK_URL=https://…
```

Registration storage: [src/lib/applications.ts](src/lib/applications.ts).
Partnership delivery: [src/lib/submissions.ts](src/lib/submissions.ts).
A failed optional registration notification does not undo a saved registration.

---

## Design system

Tokens are defined once in the `@theme` block of
[src/app/globals.css](src/app/globals.css) and used as normal Tailwind
utilities (`bg-ink`, `text-accent`, `border-line`, …).

- **Colours** — sampled from the logomark and the Instagram artwork: a pale
  blue-white ground (`.brand-sky`), deep navy `#0b2a6b` for headings, accent
  blue `#1e6be8`, sky `#2e90ff` and cyan `#3ec8f4`. Headline gradients run
  navy → blue exactly like the posters. No purple — the brand doesn't use it.
- **Type** — Rubik, one family covering both Hebrew and Latin, loaded via
  `next/font`. Heading scales are fluid `clamp()` values: `.display`, `.h1`,
  `.h2`, `.h3`, `.lede`.
- **Section rhythm** — light hero → white → pale blue → **dark** program →
  white → pale blue → **dark** Demo Day → white → pale blue → white FAQ →
  **dark** CTA → dark footer.
- **Brand graphics** — [BrandDecor.tsx](src/components/BrandDecor.tsx) carries
  the three static motifs from the artwork: the layered `Waves`, the
  `CircuitCorner` traces and the `Molecules` node cluster. Each takes a `tone`
  so it works on light and dark sections.
- **Logos** — the official lockups live in [src/assets/brand/](src/assets/brand/)
  and are served through [Logo.tsx](src/components/Logo.tsx). `logo`/`reichman`
  are the navy versions for light backgrounds; `-light` variants recolour the
  navy to white for the dark sections. The favicon and Apple icon are generated
  from the mark (`src/app/icon.png`, `src/app/apple-icon.png`).
- **Layout helpers** — `.shell` (max width + gutters), `.section` (vertical
  rhythm), `.card`, `.btn`/`.btn-primary`/`.btn-ghost`, `.eyebrow`.
- **Dark surfaces** get the `on-dark` class, which flips the text/border tokens
  for everything inside.

RTL is handled with logical properties (`ms-`, `pe-`, `inset-s-`, `text-start`),
so both directions come from the same markup.

### Motion

Deliberately subtle, and all of it respects `prefers-reduced-motion`:

- [`<CircuitFlow>`](src/components/CircuitFlow.tsx) — the site-wide circuit
  network. Each section renders one slice; the spine sits at the same horizontal
  position (`spineX`, default 7%) everywhere, so it reads as a single trace being
  drawn as you scroll. The spine grows with `scaleY`, branches draw with
  framer-motion's `pathLength`, and their nodes fade + scale in as the line
  reaches them. `variant` (0–5, increasing density) picks the branch set and
  `tone` adapts it to light or dark sections. The whole layer is mirrored in RTL.
- [`<Reveal>`](src/components/Reveal.tsx) — fade + rise on scroll, used everywhere
- Hero pipeline cycles through Idea → POC on a loop
- Program timeline rail fills as you scroll (horizontal on desktop, vertical on mobile)
- Partner logos scroll in a slow marquee once `partners` is populated

Reveals ship with `opacity:0` inline, so the layout includes a `<noscript>`
override that makes everything visible without JS.

---

## SEO

Per-locale `<title>`/description/keywords, `hreflang` alternates between `en`
and `he`, Open Graph + Twitter tags, `EducationalOrganization` JSON-LD, sitemap
and robots. Set the real domain in `contact.siteUrl`
([src/content/config.ts](src/content/config.ts)) — it is the base for every
canonical URL.

There is no OG image yet; add `public/og.png` (1200×630) and reference it from
`openGraph.images` in [src/app/[lang]/layout.tsx](src/app/[lang]/layout.tsx).

---

## Deploying

Vercel, zero config: import the repo, set the environment variables above, done.
`npm run build` also produces a standard Next.js output for any Node host.

---

## Before launch — content that still needs a decision

These are placeholders written to read sensibly, not confirmed facts:

1. **Contact email** — currently `futurebuilders@post.runi.ac.il` in `contact`.
2. **Social links** — LinkedIn and Instagram point at the bare domains.
3. **Site URL** — `contact.siteUrl` is a placeholder domain.
4. **"Is the program free?"** — the FAQ answer defers the question. Replace with
   the real answer.
5. **"When does registration open?"** — same; add the actual dates.
6. **Partner logos** — intentionally none. See `partners` above.

## Growing the site (phase 2+)

AI Radar is implemented at `/he/ai-radar` and `/en/ai-radar`, with an editorial
dashboard at `/*/admin/ai-radar`, live RSS imports, model comparison, company/tool
catalogs, events and a shared home-page feed. Setup, migration, scheduling,
source/translation policies and validation are documented in [AI-RADAR.md](AI-RADAR.md).

The locale-scoped App Router layout means new pages are just new folders under
`src/app/[lang]/`. Project and speaker detail pages can read from the same
arrays in `config.ts`, or those arrays can be swapped for a CMS fetch without
touching any component.
# future-builders
