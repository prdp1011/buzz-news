import { NextResponse } from "next/server";
import { dbGetSectionBySlug, dbListQuizzes } from "@/server/quiz-queries";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const section = await dbGetSectionBySlug(slug);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const quizzes = await dbListQuizzes(slug);
  return NextResponse.json({ section, quizzes });
}
