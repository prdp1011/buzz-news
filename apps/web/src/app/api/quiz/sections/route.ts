import { NextResponse } from "next/server";
import { dbGetQuizSections } from "@/server/quiz-queries";

export async function GET() {
  const rows = await dbGetQuizSections();
  return NextResponse.json(rows);
}
