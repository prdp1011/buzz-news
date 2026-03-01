/**
 * Vercel Cron: Content ingestion
 * Triggered by Vercel Cron (see vercel.json).
 * Secured by CRON_SECRET - only Vercel's cron or requests with the secret can run it.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for ingestion

export async function GET(request: Request) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get("user-agent")?.includes("vercel-cron");

  if (cronSecret && !isVercelCron) {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { runIngestion } = await import("worker/ingest");
    await runIngestion();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Ingestion failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingestion failed" },
      { status: 500 }
    );
  }
}
