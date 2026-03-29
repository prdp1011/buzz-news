import { NextResponse } from "next/server";
import { dbListSidebarQuizzes } from "@/server/quiz-queries";

export async function GET() {
  const rows = await dbListSidebarQuizzes();
  return NextResponse.json(rows);
}
