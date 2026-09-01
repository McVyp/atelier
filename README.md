# atelier

a personal space — journal, work, and things in between.

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build)

![CI](https://github.com/McVyp/atelier/actions/workflows/ci.yml/badge.svg)

## Tech Stack

- Astro (SSR via @astrojs/cloudflare) - pages and routing
- Notion API - headless CMS for blog posts and work/project entries
- GitHub REST + GraphQL API - recent activity feed and contribution stats
- Cloudflare KV - a `key-value` store used here as a server-side cache layer for both Notion and GitHub data

## Architecture

**_adding soon_**

Each `get*` function in `notion.ts`/`github.ts` checks KV first, falls back to a live API call on a miss, then writes the result back to KV (1hr TTL).

> _NOTE:_
>
> - `getWork` / `getBlogPosts` are pinned to `"Notion-Version": "2022-06-28"`.
> - `getBlogPostMarkdown` uses the `/v1/pages/:id/markdown` endpoint, which uses `"Notion-Version": "2026-03-11"`

## Local Dev

```bash
cp .env.example .env # fill in your values
pnpm install
pnpm dev
```
