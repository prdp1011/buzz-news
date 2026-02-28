# Gen Z News Platform

Production-ready monorepo for an AI-powered Gen Z news platform.

## Architecture

```
genz-news-platform/
├── apps/
│   ├── web/          # Public Next.js site (SSR, SEO)
│   ├── admin/        # Admin panel (auth, CRUD, approve/reject)
│   └── worker/       # RSS ingestion worker (cron-ready)
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── ai-module/    # AI content processing (placeholders)
│   └── shared/       # Shared types
├── docker-compose.yml
├── Dockerfile
└── turbo.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (or use Docker)

### Local Development

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

3. **Initialize database**

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

4. **Run all apps**

   ```bash
   pnpm dev
   ```

   - Web: http://localhost:3000
   - Admin: http://localhost:3001 (login: admin@genznews.com / admin123)
   - Worker: runs in background, fetches RSS every hour

### Docker

```bash
# Start PostgreSQL only (for local dev)
docker-compose up -d postgres

# Or run everything
docker-compose up -d
```

Then run migrations and seed:

```bash
pnpm db:push
pnpm db:seed
```

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm dev`     | Run all apps in dev mode       |
| `pnpm dev:web` | Run public site only           |
| `pnpm dev:admin` | Run admin panel only         |
| `pnpm dev:worker` | Run worker only             |
| `pnpm build`   | Build all packages and apps   |
| `pnpm db:generate` | Generate Prisma client    |
| `pnpm db:push` | Push schema to DB (no migrations) |
| `pnpm db:migrate` | Run migrations              |
| `pnpm db:seed` | Seed database                  |
| `pnpm db:studio` | Open Prisma Studio          |
| `pnpm --filter worker ingest` | One-shot ingestion (cron) |

## API Routes

### Public (web)

- `GET /api/posts` - List posts (query: `category`, `limit`, `offset`)
- `GET /api/posts/[slug]` - Get single post

### Admin (admin)

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET/POST /api/posts` - List/Create posts
- `GET/PUT /api/posts/[id]` - Get/Update post
- `POST /api/posts/[id]/approve` - Approve draft
- `POST /api/posts/[id]/reject` - Reject draft

## AI Module

Placeholder implementations in `packages/ai-module`. Replace with:

- **OpenAI GPT-4** - `rewriteContent`, `generateSEOTitle`, `generateSummary`, `generateTags`
- **Anthropic Claude** - Same functions
- **Local (Ollama)** - For cost-effective processing

## Worker (Cron)

Run ingestion on a schedule:

```bash
# Every hour via cron
0 * * * * cd /path/to/project && pnpm --filter worker ingest
```

Or use the built-in interval (set `CRON_INTERVAL_MS`).

## Environment Variables

| Variable            | Description                    |
| ------------------- | ------------------------------ |
| `DATABASE_URL`      | PostgreSQL connection string   |
| `JWT_SECRET`        | Admin session signing (32+ chars) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (JSON-LD)  |
| `CRON_INTERVAL_MS`  | Worker interval (default: 1h)  |

## License

MIT
