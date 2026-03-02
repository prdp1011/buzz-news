import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// In serverless (Vercel), limit connections to avoid pool exhaustion with Supabase/PgBouncer
function getDatasourceOverrides():
  | { datasources: { db: { url: string } } }
  | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("connection_limit=")) return undefined;
  const sep = url.includes("?") ? "&" : "?";
  return {
    datasources: { db: { url: `${url}${sep}connection_limit=1` } },
  };
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...getDatasourceOverrides(),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
