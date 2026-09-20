# From Washington To You

Explore Washington, one story at a time. A source-backed, postcard-inspired atlas of Washington State.

Product source of truth: [`docs/FROM_WASHINGTON_TO_YOU_PROJECT.md`](docs/FROM_WASHINGTON_TO_YOU_PROJECT.md)  
Build order: [`ROADMAP.md`](ROADMAP.md)

**Live:** [fromwashingtontoyou.com](https://fromwashingtontoyou.com) (Porkbun DNS → Vercel). Production app: [from-washington-to-you.vercel.app](https://from-washington-to-you.vercel.app).

## Local setup

```bash
pnpm install
cp .env.example .env.local
# Fill DATABASE_URL (pooler) and DIRECT_URL (direct) from Supabase
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The app is at [http://localhost:3000](http://localhost:3000). Health: [http://localhost:3000/api/health](http://localhost:3000/api/health).

### Supabase connection strings

In the Supabase dashboard: **Project Settings → Database → Connection string**.

| Env var | Which URI | Used for |
| --- | --- | --- |
| `DATABASE_URL` | Transaction pooler (port **6543**) | Next.js / Vercel |
| `DIRECT_URL` | Session / direct (port **5432**) | `pnpm db:migrate` |

We use Supabase as hosted Postgres + PostGIS only. No Auth, Realtime, or Storage client in the app.

`docker-compose.yml` is an optional offline PostGIS fallback, not required.

## Workspace

```text
apps/web              Next.js App Router (UI + /api)
packages/database     Drizzle schema, migrations, seed, content:check
packages/shared       Zod schemas and domain constants
data/stories/         One YAML file per story
apps/web/public/media Public-domain postcard photographs (credits in CREDITS.md)
```

## Add a story

1. Copy an existing file in `data/stories/` and give it a new slug.
2. Every claim needs at least one source already listed on the story. Use a real URL. Prefer Tier S/A/B (government, tribal, academic, archive). Tier D is discovery-only and will warn.
3. Coordinates must be inside the Washington bounding box unless you set `allowOutsideWashington: true`.
4. Do not invent dates, citations, or coordinates. If precision is geologic or unknown, say so with `datePrecision` and an explicit `dateLabel`.
5. Images must be public domain or CC0, with creator, source URL, license, credit line, and descriptive alt text. Store the file in `apps/web/public/media/` and point `media.url` at `/media/filename.jpg`.
6. Validate, then ingest:

```bash
pnpm content:check
pnpm db:seed
```

A story appears on the map and at `/story/:slug` only when `status` is `PUBLISHED` and `verificationStatus` is `VERIFIED` or `DISPUTED`.

Map views are shareable with `?lat=&lng=&zoom=&category=&story=`. `GET /api/map/stories` accepts the same `bbox`, `categories`, and `zoom` query so viewport filtering can turn on without changing the contract. Optional `geometryFile` on a story points at official GeoJSON in `data/geometries/` (line or polygon); the marker is still the point-on-surface.

Search (`GET /api/search?q=`), Surprise Me (`GET /api/discovery/random?excludeStoryIds=`), related stories (`GET /api/stories/:slug/related`), and nearby (`GET /api/discovery/nearby?lat=&lng=&radiusKm=`) are live. Search and Surprise Me sit on the map; related links appear on the postcard. Nearby is an API for later UI.

Every published story is also on [`/stories`](http://localhost:3000/stories), a server-rendered list with category, region, and search filters. That page is the non-map path for readers and crawlers.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Workspace unit tests |
| `pnpm --filter @fwty/web test:e2e` | Playwright journeys + axe on `/stories` |
| `pnpm lint` | Workspace lint |
| `pnpm typecheck` | Workspace TypeScript |
| `pnpm content:check` | Validate YAML stories (schema, gates, geometry) |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:seed` | Ingest YAML stories from `data/stories/` |

## Production notes

Supabase (pooler `DATABASE_URL`, direct `DIRECT_URL`) and the Vercel project are already live. Optional: Sentry (`SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`). Media upload to Vercel Blob is still deferred until we have licensed images.

Analytics is **Vercel Web Analytics** plus Speed Insights — no Google Analytics, no cookies. Custom events (`story_opened`, `source_clicked`, `surprise_me_clicked`, and the rest) answer editorial questions. Turn Web Analytics on in the Vercel project dashboard after deploy.
