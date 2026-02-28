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
│   ├── ai-module/    # AI content processing (OpenAI + fallbacks)
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

- `GET /api/health` - Health check
- `GET /api/posts` - List posts (query: `category`, `limit`, `offset`)
- `GET /api/posts/[slug]` - Get single post

### Admin (admin)

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/health` - Health check
- `GET/POST /api/posts` - List/Create posts
- `GET/PUT /api/posts/[id]` - Get/Update post
- `POST /api/posts/[id]/approve` - Approve draft
- `POST /api/posts/[id]/reject` - Reject draft

## AI Module

OpenAI integration in `packages/ai-module` with fallback to placeholders when `OPENAI_API_KEY` is not set:

- **rewriteContent** - Gen Z tone, casual language
- **generateSEOTitle** - 50-60 char SEO titles
- **generateSummary** - Meta descriptions
- **generateTags** - Topic extraction

Set `OPENAI_API_KEY` for production. Uses `gpt-4o-mini` by default (override with `OPENAI_MODEL`).

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
| `OPENAI_API_KEY`    | OpenAI API key (optional, fallback to placeholders) |
| `OPENAI_MODEL`      | Model name (default: gpt-4o-mini) |
| `LOG_LEVEL`         | Worker log level (debug/info/warn/error) |

## License

MIT
