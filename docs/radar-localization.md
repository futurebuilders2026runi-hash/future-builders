# AI Radar language policy

The route locale controls server listings, client refreshes, featured stories,
home page headlines, detail pages and sitemap entries. Product and company names
retain their original spelling. Hebrew news needs Hebrew prose in its headline,
summary and editorial rationale; untranslated imports remain on the English site
and get a pending translation review. They are not silently labelled Hebrew.

`src/content/radar-translations.ts` contains reviewed translations of existing
source headlines and short, attributed descriptions based on source metadata and
RSS excerpts. Importing a known headline applies that translation. New unknown
headlines require an editorial translation; the optional configured self-hosted
draft generator can assist but still requires review. No paid translation service
or external default has been added.

Run `npm run radar:localize` to apply the reviewed catalog to existing records.
It writes a local backup and an admin-restorable audit snapshot for each change,
preserves English/source URLs/publication dates and publication decisions, skips
existing editorial Hebrew, and is safe to rerun. The original four bilingual seed
stories remain unchanged.

Reuven Lerner is listed as a community partner at the club's request. Newsletter
frequency and subject were checked at
https://lernerpython.com/become-a-better-developer/ and the trainer/author bio at
https://lernerpython.com/about-reuven-lerner/. The future club visit has no announced
date or subject; it is not represented as a scheduled event.
