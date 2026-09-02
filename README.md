# atelier
a personal space — journal, work, and things in between.

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build)

![CI](https://github.com/McVyp/atelier/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
## Tech Stack

- Astro (SSR via @astrojs/cloudflare) - pages and routing
- Notion API - headless CMS for blog posts and work/project entries
- GitHub REST + GraphQL API - recent activity feed and contribution stats
- Cloudflare KV - a `key-value` store used here as a server-side cache layer for both Notion and GitHub data

## Architecture
<p align="center">
  <img width="662" height="522" alt="atelier drawio (1)" src="https://github.com/user-attachments/assets/fdf60129-3d0d-485d-9f99-3706eeb329c7" />
</p>


Each `get*` function in `notion.ts`/`github.ts` checks KV first, falls back to a live API call on a miss, then writes the result back to KV (1hr TTL).

> _NOTE:_
>
> - `getWork` / `getBlogPosts` are pinned to `"Notion-Version": "2022-06-28"`.
> - `getBlogPostMarkdown` uses the `/v1/pages/:id/markdown` endpoint, which uses `"Notion-Version": "2026-03-11"`

## Notion Page
<img width="1855" height="917" alt="image" src="https://github.com/user-attachments/assets/5a6d3bbf-ab22-4101-9eae-1f70e511767d" />

## Local Dev

```bash
cp .env.example .env # fill in your values
pnpm install
pnpm dev
```
