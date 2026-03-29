import { NextResponse } from "next/server";
import { dbGetQuizQuestionByIndex } from "@/server/quiz-queries";

type Props = { params: Promise<{ slug: string; num: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug, num } = await params;
  const n = Number.parseInt(num, 10);
  if (!Number.isFinite(n) || n < 0) {
    return NextResponse.json({ error: "Invalid question index" }, { status: 400 });
  }
  const payload = await dbGetQuizQuestionByIndex(slug, n);
  if (!payload) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(payload);
}
