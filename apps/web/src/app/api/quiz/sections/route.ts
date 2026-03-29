import { NextResponse } from "next/server";
import { dbGetQuizSections, dbGetQuizSectionsPaginated } from "@/server/quiz-queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.has("page")) {
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") ?? "12", 10);
    const data = await dbGetQuizSectionsPaginated({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 12,
    });
    return NextResponse.json(data);
  }
  const rows = await dbGetQuizSections();
  return NextResponse.json(rows);
}
