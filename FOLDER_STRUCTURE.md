# Folder Structure

```
buzz-news-platform/
├── apps/
│   ├── web/                    # Public website (Next.js App Router)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/posts/          # API: list, get by slug
│   │   │   │   ├── category/[slug]/     # Dynamic category page
│   │   │   │   ├── post/[slug]/         # Dynamic post page
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx             # Homepage (trending)
│   │   │   ├── components/
│   │   │   └── lib/
│   │   │       ├── json-ld.ts           # JSON-LD structured data
│   │   │       └── trending.ts          # Trending algorithm
│   │   └── package.json
│   │
│   ├── admin/                  # Admin panel (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/
│   │   │   │   │   ├── auth/            # login, logout
│   │   │   │   │   └── posts/           # CRUD, approve, reject
│   │   │   │   ├── drafts/              # Pending approval list
│   │   │   │   ├── login/
│   │   │   │   ├── posts/
│   │   │   │   │   ├── [id]/            # Edit post
│   │   │   │   │   └── new/             # Create post
│   │   │   │   └── page.tsx             # Dashboard (analytics placeholder)
│   │   │   ├── components/
│   │   │   └── lib/
│   │   │       ├── auth.ts              # JWT session
│   │   │       └── slugify.ts
│   │   └── package.json
│   │
│   └── worker/                 # Content ingestion worker
│       ├── src/
│       │   ├── index.ts        # Cron loop entry
│       │   └── ingest.ts       # RSS fetch, dedup, AI, save draft
│       └── package.json
│
├── packages/
│   ├── database/               # Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── client.ts      # Prisma singleton
│   │       └── index.ts
│   │
│   ├── ai-module/              # AI content processing
│   │   └── src/
│   │       └── index.ts        # rewriteContent, generateSEOTitle, etc.
│   │
│   └── shared/                 # Shared types
│       └── src/
│           └── types.ts
│
├── docker-compose.yml
├── Dockerfile                  # Multi-stage (web, admin, worker)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Clean Architecture Notes

- **Domain**: Prisma models (posts, categories, sources, etc.)
- **Use cases**: API routes, worker ingest pipeline
- **Adapters**: Next.js pages, Prisma client
- **Infrastructure**: PostgreSQL, external RSS feeds

The AI module is a **port**—implement the interface with OpenAI/Claude when ready.
