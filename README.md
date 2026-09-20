# From Washington To You

Explore Washington, one story at a time. A source-backed, postcard-inspired atlas of Washington State.

Product source of truth: [`docs/FROM_WASHINGTON_TO_YOU_PROJECT.md`](docs/FROM_WASHINGTON_TO_YOU_PROJECT.md)  
Build order: [`ROADMAP.md`](ROADMAP.md)

**Public domain:** [fromwashingtontoyou.com](https://fromwashingtontoyou.com) (registered at Porkbun). DNS attaches to Vercel in Phase 7.

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
packages/database     Drizzle schema, migrations, client
packages/shared       Zod schemas and domain constants
data/                 Story seed files (Phase 1)
scripts/              Ingestion and validation (Phase 1)
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Workspace tests |
| `pnpm lint` | Workspace lint |
| `pnpm typecheck` | Workspace TypeScript |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:seed` | Ingest YAML stories from `data/stories/` |

## Still needed for production

1. Create a Supabase project, paste pooler + direct URIs into `.env.local`, run `pnpm db:migrate`.
2. Create a Vercel project with root directory `apps/web` (include files outside the root directory).
3. Set `DATABASE_URL` (pooler) and `DIRECT_URL` (direct) in Vercel env vars.
4. Optional: create a Sentry project and set `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`.
5. Point Porkbun DNS at Vercel when launching (Phase 7) — do not do this until a production deploy exists.
