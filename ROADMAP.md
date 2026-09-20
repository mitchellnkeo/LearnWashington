# ROADMAP — From Washington To You

> Build plan for the postcard-inspired, source-backed interactive atlas of Washington State.
> Companion to `docs/FROM_WASHINGTON_TO_YOU_PROJECT.md` (the product/editorial source of truth).
> This roadmap covers **how and in what order** we build, deploy to Vercel, acquire the domain, and scale.

---

## 0. How to Use This Roadmap

- Phases are ordered. Each phase has **tasks** and **exit criteria**. Do not start a phase's successor until exit criteria are met (content production is the exception — it runs as a parallel track).
- Every phase honors the project's non-negotiables: **every story has a source**, accessibility is first-class, the map is not the only way to reach content, and no fabricated facts/citations/coordinates.
- Where this roadmap deviates from `PROJECT.md`, the deviation is called out explicitly in §1 with the trade-off named. If accepted, amend `PROJECT.md` to match so the two documents never disagree silently.

---



## 1. Architecture Decisions (decide before Phase 0)

These are the decisions that are expensive to reverse. Each is stated with its trade-off.

### 1.1 Framework & hosting: Next.js (App Router) on Vercel — **deviation from [PROJECT.md](http://PROJECT.md)**

`PROJECT.md` §18–19 recommends a Vite SPA + separate Express API (hosted on Render/Fly/Railway). Since the deployment target is Vercel and this is a public, SEO-dependent, read-mostly content site, the recommendation is:

- **One Next.js application** deployed to Vercel, serving both the UI and the API (via route handlers under `/api/...`).
- Story pages (`/story/:slug`), place pages, and category pages are **server-rendered / statically generated with ISR** (incremental static regeneration). This directly satisfies PROJECT.md §28 (SEO: "a search engine should be able to find Mount St. Helens without the map loading") without a later migration.
- The map experience remains a client-rendered MapLibre view inside the app.

**Trade-off, named explicitly:**

- *Optimizes for:* single deployment, zero-config CDN caching, first-class SEO/Open Graph per story, near-infinite read scaling (static pages served from edge cache, not compute), one vendor bill, preview deployments per PR.
- *Costs:* couples hosting to Vercel more than the provider-agnostic Express plan (PROJECT.md §71 warns against vendor lock-in); API logic lives in serverless route handlers instead of a long-running Node process (cold starts, per-invocation DB connections — mitigated in §1.3); Next.js has more framework surface area than Vite.
- *Mitigation of lock-in:* keep all domain logic in plain TypeScript service modules (`packages/` or `src/server/`), keep route handlers thin (validation + call service + shape response). If we ever leave Vercel, the services port to Express in days, not months.

**Fallback option (if the deviation is rejected):** Vite SPA on Vercel static hosting + Express API on Render/Fly + pre-rendering for SEO later. This preserves PROJECT.md exactly but costs a second deployment target, delayed SEO, and more CORS/config surface. Not recommended given the stated goals.

### 1.2 Repository: pnpm workspace monorepo (per PROJECT.md §17, adapted)

- `apps/web` — the Next.js app (UI + API route handlers).
- `packages/database` — Drizzle ORM schema, migrations, DB client.
- `packages/shared` — Zod schemas, domain types, constants (categories, confidence levels, tiers).
- `scripts/` — seed ingestion, content validation, source-health checks.
- `data/` — content seed files (YAML/JSON stories, sources, claims).
- `docs/` — existing project documentation + ADRs.

The `apps/web` + `apps/api` split from PROJECT.md collapses into one app; everything else stays.

### 1.3 Database: Supabase Postgres with PostGIS

PostGIS is mandatory (PROJECT.md §13). The owner already has a Supabase account, so we use **Supabase as hosted Postgres** — not Auth, Realtime, or Storage.

- **Transaction pooler** (`DATABASE_URL`, port 6543) — what Next.js / Vercel use. Solves the serverless connection-per-invocation problem.
- **Direct/session URI** (`DIRECT_URL`, port 5432) — what migrations use. The pooler cannot run some DDL reliably.
- **PostGIS + `pg_trgm`** enabled by the first Drizzle migration.
- Schema stays standard PostgreSQL, portable to Neon or any other PostGIS host later.

*Trade-off:* we do not get Neon-style preview-branch databases out of the box. For this read-mostly atlas that is fine; a dedicated non-production Supabase project (or later a second database) is enough. Docker Compose PostGIS remains an optional offline fallback.

### 1.4 Media storage: Vercel Blob (MVP) → S3-compatible if needed

Hero images and media assets go in object storage behind a CDN. Vercel Blob is zero-config for MVP volumes (100–250 postcards ≈ a few hundred images). If costs or portability ever matter, migrate to Cloudflare R2/S3 — the `media_assets` table stores URLs, so migration is a data update, not a schema change. All media records must carry license, creator, credit line, and alt text before anything is displayed (PROJECT.md §16).

### 1.5 Map basemap & tiles

- **MapLibre GL JS** for rendering (per PROJECT.md §18).
- Basemap: a visually quiet vector style from **MapTiler** or **Stadia Maps** free/low tier (both serve MapLibre-compatible styles), or self-selected OpenFreeMap style. Decide during Phase 1 based on visual fit with the postcard aesthetic; the style URL is an env var, so it's swappable.
- **No self-hosted vector-tile infrastructure** for MVP (PROJECT.md §43 explicitly defers this).



### 1.6 Search: PostgreSQL full-text + `pg_trgm` (per PROJECT.md §21)

No Elasticsearch/Algolia until Postgres search is demonstrably insufficient. At 100–250 stories it will not be.

### 1.7 Analytics, errors, observability

- **Analytics:** Vercel Web Analytics (privacy-respecting, no cookies) plus custom events (`story_opened`, `source_clicked`, `surprise_me_clicked`, etc. per PROJECT.md §52). Alternative if more event flexibility is needed: Plausible.
- **Error tracking:** Sentry (frontend + route handlers).
- **Logs:** Vercel runtime logs with structured JSON logging in route handlers; `GET /api/health` endpoint.



### 1.8 Domain: `fromwashingtontoyou.com`

Checked 2026-09-06 — **available**:


| Domain                  | Price/yr | Status    |
| ----------------------- | -------- | --------- |
| fromwashingtontoyou.com | $11.25   | Available |
| fromwashingtontoyou.org | $8.49    | Available |
| fromwashingtontoyou.us  | $7.99    | Available |


**Purchased 2026-09:** `fromwashingtontoyou.com` at Porkbun. Apex ALIAS + `www` CNAME point at `cname.vercel-dns.com`. Certificates issued; `www` 308s to the apex. Optional defensive `.org` is still available.

---



## 2. Scaling Posture (the "what backend do we need" answer)

The honest answer: **this workload is read-mostly, small-data, and cache-friendly — the backend can stay simple and still scale to very large traffic.** The dataset is 100–250 (eventually a few thousand) stories; the entire published marker set is kilobytes. The scaling strategy is *caching, not compute*:

1. **Story/place/category pages:** statically generated with ISR. Served from Vercel's edge CDN. A traffic spike (a story goes viral, a teacher shares a link) hits cached HTML, not the database. Revalidate on publish or on a modest timer.
2. **Map markers:** at MVP scale, serve the full published-marker GeoJSON as a single cached response (regenerated when content publishes) and let MapLibre cluster client-side. This is *more* scalable than dynamic bbox queries because it's a CDN cache hit. Keep the bbox endpoint contract (`GET /api/map/stories?bbox=...`) designed per PROJECT.md §23 and switch to true bbox querying when the dataset grows past what one payload should carry (roughly >2,000–5,000 features — measure, don't guess).
3. **Dynamic endpoints** (search, surprise-me, nearby): low volume, hit Supabase through the pooled connection; add `s-maxage`/`stale-while-revalidate` cache headers where responses are shareable.
4. **Database:** Supabase pooler + compute absorbs bursts at this scale; GiST spatial indexes + standard btree indexes on all filter columns; a larger compute add-on is the escape hatch we almost certainly never need.
5. **Abuse protection:** Vercel's built-in DDoS mitigation + WAF rate-limit rules on `/api/`* (the MVP has no writes from the public, so the attack surface is small — PROJECT.md §46).

**What we deliberately do NOT build** (per PROJECT.md §79 and the coding guide's YAGNI/simplest-design rules): microservices, Redis, queues, Elasticsearch, GraphQL, vector-tile servers, Kubernetes. Each has a named trigger for reconsideration (e.g., Redis only if measured DB load from hot queries exceeds what HTTP caching solves; vector tiles only past several thousand geometries).

**Future write-path note:** MVP is read-only to the public. If Phase 3 features (accounts, submissions) ever arrive, that is the moment to introduce auth (managed provider, not custom) and revisit rate limiting — not before.

---



## 3. Phase 0 — Foundation (repo, tooling, environments)

**Goal:** a deployable skeleton with CI, database, and secrets in place. No product features yet — keep this phase short.

### Tasks

- [x] **Buy** `fromwashingtontoyou.com` (Porkbun). Optional `.org` still available.
- [x] Initialize pnpm workspace monorepo per §1.2 structure; commit `PROJECT.md` guidance docs into `docs/`.
- [x] Scaffold Next.js (App Router, TypeScript strict) in `apps/web` with Tailwind CSS.
- [x] Create `packages/shared` with initial Zod schemas/domain types (story status enum, verification enum, source tiers, confidence levels, category slugs).
- [x] Create `packages/database` with Drizzle configured for Postgres.
- [x] Docker Compose file kept as an optional offline PostGIS fallback (not the default).
- [x] First migration: enable `postgis` and `pg_trgm` extensions.
- [x] Create a Supabase project; enable nothing extra in the dashboard (migration adds PostGIS); put pooler `DATABASE_URL` and direct `DIRECT_URL` in `.env.local` and later in Vercel.
- [x] Create Vercel project, link the repo, confirm preview deployments on PRs.
- [x] Tooling: ESLint, Prettier, `typecheck`/`lint`/`test`/`build` root scripts orchestrating the workspace.
- [x] GitHub Actions CI on PRs: install → lint → typecheck → test → build (PROJECT.md §72). Production deploy gated on green checks.
- [x] Set up Sentry (DSN in env vars only) and a `GET /api/health` route.
- [x] Start an `docs/adr/` folder; record ADR-001 (Next.js-on-Vercel deviation, §1.1) and ADR-002 (Supabase Postgres + PostGIS, §1.3).



### Exit criteria

- `pnpm dev` runs the app locally against Supabase; `/api/health` reports `database: up`; a trivial page deploys to a Vercel preview URL; CI is green; the domain is owned.

---



## 4. Phase 1 — First Map + First Vertical Slice

**Goal:** PROJECT.md §75's first slice, end to end: one real story (Mount St. Helens), one marker, one postcard, real sources. Vertical slice before infrastructure breadth — "do not create twenty tables and zero visible product."

### Tasks

- [x] MapLibre map renders Washington full-screen; bounds constrained sensibly to the state + margin; responsive layout shell (map is the default page).
- [x] Choose and configure the quiet basemap style (§1.5); state boundary reads clearly; commercial labels don't overpower content (PROJECT.md §32).
- [x] Minimum schema (migrations): `stories`, `places`, `categories`, `tags`, `story_tags`, `story_categories`, `sources`, `story_sources`, `claims`, `claim_sources`, `media_assets`, `related_stories` — geometry columns as `GEOMETRY(Geometry, 4326)` with GiST indexes (PROJECT.md §12–14).
- [x] Seed-file format: YAML per PROJECT.md §39, validated with Zod before insert; ingestion script in `scripts/` (idempotent — safe to re-run).
- [x] Author the **Mount St. Helens 1980 eruption** seed story with real USGS/WA Geological Survey sources, structured claims linked to sources, verified coordinates. No placeholder facts in fixtures (PROJECT.md §76).
- [x] API route handlers: `GET /api/stories/:slug` (full postcard payload) and `GET /api/map/stories` (GeoJSON, marker-fields only — never full bodies, PROJECT.md §22).
- [x] Marker renders from API GeoJSON; click opens the **postcard drawer** (desktop side drawer) showing title, hook, body, category, location label, source list with tier/type badges, last-reviewed date.
- [x] `/story/mount-st-helens-1980-eruption` exists as a server-rendered permanent URL with title/description/Open Graph metadata (SEO from day one, cheap under Next.js).
- [x] Consistent API error shape: `{ error: { code, message, details? } }`; no stack traces in production (PROJECT.md §56).



### Exit criteria

- On a Vercel preview URL: open site → see map → click marker → read the Mount St. Helens postcard → click through to a real USGS source. The story URL loads standalone with correct metadata.

---



## 5. Phase 2 — Story Domain Depth & Content Pipeline

**Goal:** the data model and ingestion workflow are complete enough that content production (Track C, §10) can begin in earnest and run in parallel with all remaining engineering phases.

### Tasks

- [x] Full editorial lifecycle on stories: `status` (IDEA → RESEARCHING → DRAFT → FACT_CHECK → READY → PUBLISHED → NEEDS_REVIEW → ARCHIVED) and independent `verification_status` (UNVERIFIED / PARTIALLY_VERIFIED / VERIFIED / DISPUTED). Only PUBLISHED + verified (or deliberately labeled disputed) content is publicly queryable — enforce in the query layer, not per-callsite.
- [x] Date handling: `start_date`, `end_date`, `date_precision` (day/month/year/decade/century/approximate/geologic/unknown), `date_label` — never fabricate precision (PROJECT.md §36, §58).
- [x] Claim-level provenance: claims carry `claim_type` + `confidence`; `claim_sources` join with optional locator. MVP UI may show story-level sources, but the data is claim-level from the start (PROJECT.md §11).
- [x] Data-integrity gates (DB constraints where practical, publication-check script where not): published story must have title, geometry-or-place, and ≥1 qualifying source; unique slugs; no self-referencing related stories; no duplicate claim-source links (PROJECT.md §50).
- [x] Seed the ~6 MVP categories (Geography & Geology, Wildlife & Ecology, History, Indigenous History & Place, Music & Culture, Science/Strange Washington) with icons and sort order.
- [x] `media_assets` ingestion path: every image requires license, creator, source URL, credit line, alt text before display. First 11 stories now seed public-domain photos from `apps/web/public/media/`. Vercel Blob remains optional if we outgrow the repo.
- [x] Content validation script (`pnpm content:check`): schema validity, source-tier warnings (Tier D flagged as discovery-only), missing alt text, broken/malformed URLs, geometry sanity (inside Washington bounding box unless flagged).
- [x] Add 5–10 more fully sourced stories across different regions and categories to exercise the pipeline (these count toward the 100).
- [x] Unit tests: slug generation, seed validation, publication gates, date-label formatting.



### Exit criteria

- A non-engineer-friendly, documented workflow exists: write YAML story → run validation → ingest → appears on map/URL only when publishable. Ten real stories live. Content production can now scale independently of feature work.

---



## 6. Phase 3 — Spatial API & Map Performance

**Goal:** the map stays fast and correct as marker count grows.

### Tasks

- [x] Map marker source strategy per §2: cached full-GeoJSON payload of published markers with proper cache headers + revalidation on publish; the endpoint accepts `bbox`/`categories`/`zoom` params from day one so the contract doesn't change when true bbox querying activates.
- [x] PostGIS bbox querying implemented and tested behind that contract (`ST_Intersects` with envelope), even if the MVP default serves the cached payload — this is the switch we flip at scale.
- [x] Client-side MapLibre clustering: cluster click → smooth zoom → separation (PROJECT.md §24); distinct marker styling per category (stamp-motif icons).
- [x] Debounced viewport handling; markers render only needed fields; no story bodies over the wire.
- [x] Non-point geometry support proven with at least one polygon story (e.g., a park or the Ice Age Floods region) and one line story (a river or route) — rendering + marker anchor behavior defined for each.
- [x] Map ↔ card interaction polish: selected marker state, fly-to on story open, URL query params encode map state (`?lat=&lng=&zoom=&category=`) for shareable views (PROJECT.md §27).
- [x] DB integration tests: bbox behavior, geometry round-trips, spatial index usage (`EXPLAIN` sanity checks).



### Exit criteria

- Clustering, shareable `?lat=&lng=&zoom=&category=&story=` URLs, and official line/polygon overlays are live. The catalog is still 11 sourced stories (Track C continues toward 25+). Do not pad the map with unsourced pins.

---



## 7. Phase 4 — Discovery Features

**Goal:** the exploration loop — filter, search, surprise, follow — is complete.

### Tasks

- [x] **Category filters:** touch-friendly filter UI; filters combine with map state; reflected in URL params.
- [x] **Search** (`GET /api/search?q=`): Postgres FTS + `pg_trgm` across story titles/hooks, places, tags, categories; grouped response (stories/places/tags); search UI with keyboard navigation; selecting a result flies the map and opens the postcard.
- [x] **Surprise Me** (`GET /api/discovery/random`): random eligible published story with recent-repeat avoidance (client sends `excludeStoryIds`); fly-to + open postcard; prominent button (especially on mobile).
- [x] **Related stories:** manually curated `related_stories` rows (typed relationships); postcard shows related links; clicking navigates map + card. No auto-published AI similarity (PROJECT.md §35).
- [x] **Nearby discovery groundwork** (post-MVP feature, architected now per PROJECT.md §34): `GET /api/discovery/nearby` implemented with `ST_DWithin`, simple distance ranking — cheap to build once spatial schema exists; UI exposure can wait.
- [x] API integration tests: search relevance basics, random eligibility rules, filter combinations, related retrieval.



### Exit criteria

- The full core loop works: see place → filter → open postcard → check source → follow related story → search → surprise me. Each action shareable via URL where meaningful. Nearby is an API only (`GET /api/discovery/nearby`); the “around here” UI stays Phase 8.

---



## 8. Phase 5 — Accessibility, Mobile, and the Non-Map Path

**Goal:** PROJECT.md §29–30 satisfied: the map is *not* the only way in, and mobile is designed, not shrunk.

### Tasks

- [x] **Accessible browse index:** a server-rendered `/stories` (or `/explore`) list with category/region filtering and search — the complete non-map representation of all published content. Doubles as the SEO crawl surface.
- [x] Postcard drawer/dialog: correct focus management, focus trap, Escape to close, screen-reader announcements on open/close and on map fly-to.
- [x] Full keyboard pass: all interactive elements reachable and operable; visible focus states; semantic buttons/links; landmarks.
- [x] Contrast audit against the postcard visual design; meaningful alt text verified on all published media (validation script already enforces presence — now verify quality).
- [x] `prefers-reduced-motion` respected (map fly-to animations, drawer transitions).
- [x] **Mobile:** bottom-sheet postcard (distinct from desktop drawer), touch-friendly filters, prominent Surprise Me, map gestures that don't fight page scroll.
- [x] Frontend component tests: drawer focus behavior, filter interactions, keyboard flows. Playwright E2E for the critical journeys (PROJECT.md §49: open→filter→marker→postcard→source; search→fly→open; surprise me).
- [x] Run automated a11y tooling (axe) in CI on key pages; fix findings.



### Exit criteria

- Every published story is reachable and readable without the map at `/stories`, with keyboard only, and with a screen reader. Mobile uses a bottom sheet; desktop keeps the side drawer. Published stories now carry a public-domain photograph with credit and alt text.

---



## 9. Phase 6 — Production Hardening & Launch Readiness

**Goal:** PROJECT.md Milestone 6 — security, performance, observability, analytics — verified before pointing the domain.

### Tasks

- [ ] **Security pass:** Zod validation on every route handler input; parameterized queries only (Drizzle default — verify raw-SQL spots); sanitized Markdown rendering; security headers (CSP, frame-ancestors, referrer-policy); CORS locked to the site origin; WAF rate-limit rules on `/api/`*; `pnpm audit` in CI; confirm no secrets in git history.
- [ ] **Performance pass:** Lighthouse budgets on story page + map page (mobile); lazy-load postcard media; compress GeoJSON responses; verify ISR/cache headers actually serve from CDN (check `x-vercel-cache`); index audit on all common query filters. Measure before optimizing further.
- [ ] **Caching config finalized:** ISR revalidation strategy on publish (on-demand revalidation from the ingest script), cache headers on API responses per §2.
- [ ] **Observability:** structured logs verified in Vercel; Sentry alerting configured (error-rate symptoms, not noise); health endpoint monitored (e.g., Vercel checks or an external pinger).
- [x] **Analytics events** wired: Vercel Web Analytics + Speed Insights; `story_opened`, `source_clicked`, `category_selected`, `search_used`, `surprise_me_clicked`, `related_story_clicked`. No Google Analytics. `share_clicked` waits on a share control; `map_region_explored` is too noisy for MVP.
- [ ] **SEO finalization:** sitemap.xml (all published stories/places/categories), robots.txt, canonical URLs, Open Graph images (consider a generated postcard-style OG image per story), structured data (Article/Place schema.org where it fits).
- [ ] Rollback plan documented: Vercel instant rollback for app, migration rollback discipline for DB (expand → migrate → contract for any breaking schema change).
- [ ] Legal/edge pages: About, source methodology ("Every story has a source" explained), media credits, contact, privacy note (what analytics collect).



### Exit criteria

- Staging preview passes security checklist, Lighthouse budgets, E2E suite, and a manual editorial spot-check of 10 random stories (links work, sources load, dates precise, locations right).

---



## 10. Track C — Content Production to 100 Postcards (parallel, Phases 2→7)

**This is the long pole.** Engineering phases 3–6 take weeks; researching and verifying 100 postcards takes as long or longer. Start after Phase 2 and run continuously.

### Process (per story — PROJECT.md §38, §77)

Discover → locate authoritative sources (Tier S/A preferred) → capture source metadata → identify claims → draft → verify claims → check location/date → check media rights → editorial review → publish. AI assists with discovery/drafting/summarization but is never evidence; anything unverified stays in IDEA/RESEARCHING.

### Tasks

- [ ] Build the candidate list (~130 candidates for 100 published) against the target distribution: ~20 geography/geology, 15 wildlife/ecology, 20 history, 10 Indigenous history & place, 15 music/culture, 10 science/industry, 10 strange Washington — quotas soft, quality first.
- [ ] Enforce geographic spread across all ten regions (Puget Sound, Olympic Peninsula, southwest, Cascades, north-central, Columbia Basin, northeast, southeast, Columbia Gorge, coast) — track region coverage in a simple tally; **do not become a Seattle project**.
- [ ] Indigenous content protocol before writing any of those 10 stories: tribal-government sources first, correct names/spellings, no sensitive/burial/restricted locations, generalized geography where appropriate, flag anything ambiguous for human editorial judgment rather than publishing (PROJECT.md §4.6, §69, §86.14).
- [x] Media sourcing pass for the current 11 published stories: public-domain government photography, National Archives, and one CC0 NOAA photograph — license recorded per asset; no image without cleared rights. The Hendrix card uses a public-domain Seattle aerial because no public-domain portrait exists. Repeat this pass as new stories are added.
- [ ] Curate related-story links as the collection grows (aim: every story has ≥1 relation by launch — the rabbit-hole loop is the product).
- [ ] Weekly `pnpm content:check` + broken-link scan; fix or archive-URL anything flagged.



### Milestones

- **25 stories** → enough for Phase 3/4 testing to be realistic.
- **60 stories** → soft-launch quality bar; regional spread review.
- **100 stories** → launch gate (each meets the Definition of Done for a published story, PROJECT.md §77).

---



## 11. Phase 7 — Domain & Public Launch



### Tasks

- [x] Attach `fromwashingtontoyou.com` to the Vercel project (apex + `www` redirect, automatic SSL). If bought elsewhere, point nameservers/A-records at Vercel.
- [ ] Set canonical host, update `WEB_ORIGIN`/metadata base URLs, re-verify Open Graph rendering on the real domain (test share cards on major platforms).
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools; verify indexing of a handful of story URLs.
- [ ] Final pre-launch checklist: E2E green, error tracking quiet, analytics flowing, 100 stories published, rollback tested once on purpose.
- [ ] Launch. Monitor error rates and Web Analytics for the first days; watch which regions/categories get explored (PROJECT.md §83's success measures).



### Exit criteria

- The site is live on the domain, indexed, monitored, and boring to operate.

---



## 12. Post-Launch — Phase 2 Features (only after MVP validation)

Prioritize by observed behavior (analytics), not by roadmap order. Candidates from PROJECT.md §44:

1. **Nearby discovery UI** — backend already exists (Phase 4); expose "What's interesting around here?" with privacy rules from §70 (no stored user locations, manual map-point alternative).
2. **Collections** — Ice Age Floods, Washington Volcanoes, Grunge, Salmon, Ghost Towns, Lighthouses… high editorial value, low engineering cost (a curated grouping entity + landing pages).
3. **Timeline** — needs the date-precision model (already stored); build the TimelineControl UI.
4. **Lightweight admin/editorial tooling** — only once seed-file friction actually hurts: story editor, source manager, review queue, coordinate picker (PROJECT.md §40).
5. **Source-health automation** — scheduled link checker (Vercel cron), archive-URL capture, review flags (PROJECT.md §64).
6. **Historical map overlays / thematic layers** — revisit vector-tile question only here.
7. Content growth toward 250 postcards, maintaining the quality bar.

**Still out of scope until real demand:** user accounts, comments, submissions, native apps, chatbots, personalization, gamification (PROJECT.md §43, §45).

---



## 13. Risk Register & Standing Decision Points


| Risk                                                   | Mitigation / trigger                                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Content production is slower than engineering          | Track C starts at Phase 2 and is the launch gate; engineering never blocks on it after Phase 3                           |
| Vercel serverless + DB connections exhaust under burst | Supabase transaction pooler from day one; caching absorbs read bursts (§2)                                               |
| Vendor lock-in (Vercel/Supabase)                       | Domain logic in framework-agnostic services; standard Postgres + Drizzle migrations; media URLs in DB (§1.1, §1.3, §1.4) |
| Basemap provider cost/limits at scale                  | Style URL is an env var; MapLibre keeps us provider-portable                                                             |
| SEO underperforms                                      | SSR/ISR from day one + `/stories` index + sitemap makes this unlikely; monitor Search Console post-launch                |
| A story's facts are challenged publicly                | Claim-level provenance + `NEEDS_REVIEW` status + visible last-reviewed dates; correct fast, transparently                |
| Indigenous-content missteps                            | Protocol in §10; human editorial judgment mandatory; when uncertain, don't publish (PROJECT.md §89)                      |
| Map GeoJSON payload outgrows single-response strategy  | Bbox contract already in place; flip to true bbox querying at ~2–5k features; vector tiles only well beyond that         |


---



## 14. Sequence at a Glance

```text
Phase 0  Foundation (repo, CI, Supabase+PostGIS, Vercel project, BUY DOMAIN)
Phase 1  First map + Mount St. Helens vertical slice
Phase 2  Full story domain, editorial lifecycle, ingestion pipeline
   └── Track C: content production begins (runs through launch)
Phase 3  Spatial API, clustering, non-point geometries, shareable map URLs
Phase 4  Filters, search, Surprise Me, related stories
Phase 5  Accessibility, mobile bottom sheet, non-map browse index, E2E
Phase 6  Security, performance, caching, observability, analytics, SEO
Phase 7  Attach fromwashingtontoyou.com → public launch
Post     Nearby UI, collections, timeline, admin tooling, source health
```

Guiding rule throughout (PROJECT.md §89): better-supported content over more content; better exploration over more features; maintainability over cleverness.