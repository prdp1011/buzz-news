import { NextResponse } from "next/server";
import { dbGetSitemapQuizData } from "@/server/quiz-queries";

export async function GET() {
  const data = await dbGetSitemapQuizData();
  return NextResponse.json(data);
}
