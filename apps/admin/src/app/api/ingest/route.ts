import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runIngestion } from "@/lib/ingest";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const sourceIds = body.sourceIds as string[] | undefined;

    const result = await runIngestion(sourceIds?.length ? sourceIds : undefined);

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      deduplicated: result.deduplicated,
      created: result.created,
      errors: result.errors,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Ingestion failed",
      },
      { status: 500 }
    );
  }
}
