# Buzz News Platform - Multi-stage Dockerfile
# Build stage
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/
COPY apps/worker/package.json ./apps/worker/
COPY packages/database/package.json ./packages/database/
COPY packages/ai-module/package.json ./packages/ai-module/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm db:generate

# Build packages and apps
RUN pnpm build

# Production - Web
FROM base AS web
WORKDIR /app/apps/web
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]

# Production - Admin
FROM base AS admin
WORKDIR /app/apps/admin
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./.next/static
COPY --from=builder /app/apps/admin/public ./public
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]

# Production - Worker
FROM base AS worker
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
ENV NODE_ENV=production
CMD ["node", "apps/worker/dist/index.js"]
