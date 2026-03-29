import { NextResponse } from "next/server";
import { dbListQuizzesPaginated } from "@/server/quiz-queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "12");
  const sectionSlug = searchParams.get("section") ?? undefined;
  const data = await dbListQuizzesPaginated({
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 12,
    sectionSlug: sectionSlug || undefined,
  });
  return NextResponse.json(data);
}
