# Future Builders AI Radar

## Routes and architecture

- Public: `/he/ai-radar`, `/en/ai-radar`; each published record has a detail URL at `/{locale}/ai-radar/{kind}/{id}`.
- Editorial dashboard: `/{locale}/admin/ai-radar`, using the site's existing signed, HttpOnly, eight-hour admin session. The registration inbox links to it.
- Public API: `GET /api/radar`; supports `q`, `kind`, `category`, `company`, `since`, `until`, `sort`, `eventState`, `organizer`, `location`, `eventType`, `page`, `limit` (maximum 24).
- The home page reads the same data layer: three recent news items, a featured/latest model and an upcoming/ongoing event.
- Separate Supabase tables hold news, models, companies, tools, events, categories/tags, sources, import jobs, editorial reviews and version history. Company IDs connect news, models and tools. JSONB records are validated with Zod at every editorial write.
- Existing applications and link statistics are untouched. The existing site-wide password defines the administrator role; no separate account system is introduced.

## Setup

1. Run `supabase/ai-radar.sql` in the existing project's Supabase SQL Editor. The additive migration is safe to repeat and does not change existing tables. It also creates a private media bucket. Alternatively, with a valid `DIRECT_URL`, run `npm run radar:migrate`.
2. Reuse the existing server-only `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`), `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
3. Seed verified starting content and connect feeds:

   ```sh
   RADAR_STORAGE=supabase npm run radar:seed
   RADAR_STORAGE=supabase npm run radar:import
   ```

   Or sign in to the editorial dashboard, choose **Add verified starter content**, then **Refresh sources now**. Seeding inserts missing IDs only and does not overwrite edits.
4. Set a random `CRON_SECRET` of at least 32 characters in the deployment host. `vercel.json` schedules an authenticated refresh daily at **03:00 UTC**, compatible with a daily scheduler. The scheduled endpoint rejects requests without the secret. Scheduling becomes active when this code is deployed with the secret configured.
5. For a persistent Node host, `RADAR_STORAGE=supabase npm run radar:worker` imports immediately, then every **six hours**. Run it under the host's process supervisor. Another scheduler can invoke `GET /api/cron/radar` with `Authorization: Bearer <CRON_SECRET>` at its supported frequency. Do not run the worker and an hourly cron unless both are intended; the distributed lease prevents overlaps.

Development defaults to atomic JSON files in the ignored `.data/radar` folder, even when the site's Supabase registration credentials exist. Set `RADAR_STORAGE=supabase` explicitly to test connected storage. Production always requires Supabase and never silently switches to local files. Isolated browser tests use `.data/radar-e2e`.

## Connected sources and content policy

The following publisher-provided RSS endpoints were fetched successfully on **20 October 2026**:

| Source | Endpoint | Publication policy |
|---|---|---|
| OpenAI | `https://openai.com/news/rss.xml` | Official-source digests after URL/date checks |
| Google AI | `https://blog.google/technology/ai/rss/` | Official-source digests after checks |
| Google DeepMind | `https://deepmind.google/blog/rss.xml` | Official-source digests after checks |
| Hugging Face | `https://huggingface.co/blog/feed.xml` | Manual review, because the feed includes community posts |

Feed titles, publication timestamps and source links are persisted. When the optional inference adapter is configured, a bounded publisher RSS description is passed to it in memory. The importer does **not** scrape article bodies, republish full articles, use feed images without permission, bypass access restrictions, or assume that other publishers offer RSS. A publisher's RSS link is the basis for this narrow syndication use, not a license to reuse their article or artwork. Sources should be reviewed periodically for changes in their access terms. HTTP 403/404 responses, unavailable feeds, invalid URLs, unknown hosts, invalid/future dates, oversized XML and entity declarations are rejected and recorded in run history.

The initial model records were verified against these announcements:

- GPT-6.1 Sol: <https://openai.com/index/introducing-gpt-6-1-sol/>
- Claude Sonnet 5.5: <https://www.anthropic.com/claude-sonnet-5-5>
- Gemini 4 Argon: <https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/>
- Mistral Large 4 public preview: <https://mistral.ai/news/mistral-large-4/>

Manufacturer claims, release pricing and editorial build ideas are labelled separately. Unverified plan availability, model weights, API availability or benchmark comparisons are shown as unknown. In particular, Mistral's promised weight release is not treated as an already completed release. The catalog is an editable watchlist, not an exhaustive model ranking; model/company/tool updates require editorial review rather than inferred extraction from a headline.

**Languages:** the interface, curated starter summaries, model/company/tool records and event copy have Hebrew and English versions. New automatic source digests preserve the original headline and show a clear “original headline / source digest” label. Their two-language summary describes source provenance, not the unread article. They do not masquerade as a machine translation. Editors can replace the headline, summary and “why it matters” in both languages and set the mode to **Edited & translated**. No paid translation or LLM service is required or called. An optional self-hosted Ollama adapter is implemented for bilingual headline translations and original summaries from publisher RSS descriptions. Set `RADAR_OLLAMA_URL` and `RADAR_OLLAMA_MODEL` to an already installed multilingual model. Generated drafts always enter the review queue, even for official feeds. No inference service is configured in this workspace, so actual model output quality has not been validated. The adapter processes at most two new items per source per run, has a 30-second timeout per item, and falls back to a labelled digest if inference fails. It never fetches full article bodies. See the [Ollama API documentation](https://docs.ollama.com/api/generate).

## Import behavior

1. Acquire a distributed ten-minute lease (exclusive file lock in development).
2. Save a `running` job and fetch enabled RSS/Atom sources independently, with timeouts and a two-megabyte body limit.
3. Reject XML document/entity declarations; normalize plain-text titles, HTTPS URLs, source identity and original dates. Each feed processes up to twelve recent entries per run.
4. Check external links with HEAD; redirects must remain on the source's explicitly allowed publisher hosts. Do not strip required trailing slashes when following redirects.
5. Canonicalize tracking parameters and final redirect destinations; derive stable SHA-256 IDs. Repeated imports use insert-only writes and never overwrite an editor's content, hidden status or Featured decision. The database also has a unique source-URL index.
6. Classify headlines by explicit keyword rules, attach company IDs and create clearly labelled source digests. This is a transparent rule system, not a confidence score produced by an AI model.
7. Official sources can auto-publish; community/review-only sources receive a pending editorial review. No tool becomes a Builders' Pick automatically. No event, funding amount, discount or company ranking is inferred by the importer.
8. Complete the history record with inserted, duplicate, rejected and per-source results. Crashed jobs older than the lease are marked failed at the next run. Existing content remains readable during source outages, with original dates preserved.

The public layer uses a 30-second process cache and short HTTP caching. A successful admin write invalidates the local process cache. Other instances refresh within their cache period. A warm server can retain its last verified snapshot during a database outage; a cold server shows an unavailable/empty state. Date, source and refresh timestamps are never rewritten to make content look new.

## Editing content and events

Use the appropriate dashboard tab and **Add item** or **Edit**. Fields are plain text; React escapes them. Category IDs are managed in **Categories & tags** and assigned as comma-separated lists. Common company IDs include `openai`, `anthropic`, `google`, `meta`, `mistral`, `xai`, `deepseek`, `qwen`, `qodo` and `ai21`.

For an event, fill both languages, source and organizer, start/end ISO timestamps with offsets, IANA timezone, location, type and relationship. Use **Scheduled** for a verified event and **Published** to show it. The displayed Upcoming/Ongoing/Past state comes from timestamps, including while an already-open page remains visible. Draft and Cancelled are explicit editorial states. Only verified published events appear publicly. Upcoming lists exclude past/cancelled/draft events; the archive retains past events. Date filters use each event's timezone. Registration links stop being offered when the event is past or cancelled.

The first event is **Future of AI 2026**, organized by **Lynx**, 21 October 2026, 08:00–16:00 Asia/Jerusalem, Hilton Tel Aviv. Official sources: <https://events.lynx.co/future-of-ai/> and <https://events.lynx.co/foa-26-agenda/>. Future Builders is described as a community partner, not the organizer. The existing site's approved 20% community benefit and `FB_AI_CLUB` registration URL are reused. New benefits require the explicit **Benefit approved** checkbox. Verify ticket/registration availability with the organizer before changing it.

For images, confirm usage rights, upload PNG/JPEG/WebP/AVIF (up to 5 MB), and supply bilingual alt text and credit. The server validates and re-encodes uploads to bounded WebP images, strips metadata, stores them in the private Supabase bucket and serves generated IDs through a read-only media route. SVG/HTML uploads and arbitrary remote image URLs are not supported. Existing `/events/` or `/radar/` assets can also be referenced.

## Security and recovery

All dashboard reads and writes check the existing signed session. Mutations also check the request origin. RLS and grants prevent anon/authenticated Supabase clients from reading or writing the editorial tables; only the server's service key has access. Supported-host allowlists cover both feed URLs and every redirect; no arbitrary URLs are fetched server-side from public input. Secrets are never returned by public or admin data responses.

**Version history** stores before/after snapshots for manual edits; **Restore previous version** opens a previous snapshot for review and saving. **Download backup** exports the editorial data. `RADAR_STORAGE=supabase npm run radar:export` saves a server-side JSON backup under `.data/backups`; media bytes are stored separately and need their own storage backup. Supabase database/storage backups follow the existing project's retention plan. Deleted media is not automatically pruned, so restoring an older record preserves its image references. No destructive reset or table deletion is provided.

## Validation

```sh
npm run typecheck
npm run test:radar
npx playwright install chromium   # first browser-test run only
npm run test:e2e
npm run build
```

Unit tests cover event boundaries, timezone offsets, cancellation, validation, publication privacy, bilingual search, safe RSS/Atom parsing, redirect rules, stable IDs, repeated/concurrent imports, editorial preservation and source outages. Browser tests use a separate server and data folder and cover RTL/LTR, mobile navigation, comparison/search/empty states, API authorization and a complete manual event create → publish → update → hide flow.

A real local import was run against the connected publishers and repeated to check duplicate prevention. Some OpenAI article links returned HTTP 403 and were excluded; this produces a partial run and does not stop the other sources. Connected Supabase validation must run after the SQL migration is applied. No production deployment is performed by these scripts.
