# ADR-001: Next.js on Vercel instead of Vite + Express

## Status

Accepted for Phase 0 onward.

## Context

`docs/FROM_WASHINGTON_TO_YOU_PROJECT.md` recommends a Vite SPA and a separate Express API. The deployment target is Vercel, the domain is a public content site, and every story needs a crawlable URL.

## Decision

Ship one Next.js App Router application on Vercel. The map stays a client-rendered MapLibre view. Story, place, and category pages are server-rendered (ISR later). API routes live under `/api/*`. Domain logic stays in TypeScript service modules so an Express port remains possible.

## Consequences

- SEO and Open Graph work without a later SPA-to-SSR migration.
- One deploy, preview URLs per PR, and CDN caching for read-mostly traffic.
- More coupling to Vercel than a split Vite/Express setup.
- Serverless route handlers need pooled database connections (see ADR-002).
