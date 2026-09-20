# ADR-002: Hosted Postgres with PostGIS

## Status

Superseded by the decision below. Original recommendation was Neon; the project now uses Supabase.

## Context

Stories have real geography — points, lines, and polygons. `PROJECT.md` requires PostgreSQL + PostGIS. The app is serverless on Vercel, so a naive long-lived connection pool will fail under load.

Neon and Supabase are both hosted Postgres with PostGIS. The owner already has a Supabase account, so the smaller operational path is to use that account rather than open a second vendor.

## Decision

- Schema and migrations are standard PostgreSQL + PostGIS via Drizzle.
- Host: **Supabase Postgres**. We use it as a database, not as Auth, Realtime, or Storage.
- The Next.js app uses the **transaction pooler** URL (`DATABASE_URL`, port 6543) with `prepare: false`.
- Migrations use the **direct/session** URL (`DIRECT_URL`, port 5432).
- PostGIS and `pg_trgm` are enabled by our first migration.
- Docker Compose PostGIS remains an optional offline fallback, not the default.

## Consequences

- Spatial queries stay in SQL (`ST_Intersects`, `ST_DWithin`), not JavaScript.
- The database is portable to any PostGIS host (Neon, RDS, local Docker) because we do not depend on `supabase-js`.
- Local development requires internet and a non-production Supabase project (or a later branch).
- If we ever want accounts or a table UI, Supabase Auth/Studio are available without a new vendor.
