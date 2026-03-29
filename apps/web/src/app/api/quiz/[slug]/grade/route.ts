import { NextResponse } from "next/server";
import { dbGradeQuiz } from "@/server/quiz-queries";

type Props = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || !("answers" in body)) {
    return NextResponse.json({ error: "Missing answers" }, { status: 400 });
  }
  const answers = (body as { answers: unknown }).answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }
  const map: Record<string, string | undefined | null> = {};
  for (const [k, v] of Object.entries(answers as Record<string, unknown>)) {
    if (v === null || v === undefined) map[k] = null;
    else if (typeof v === "string") map[k] = v;
    else return NextResponse.json({ error: "Invalid answer value" }, { status: 400 });
  }

  const result = await dbGradeQuiz(slug, map);
  if (!result) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  return NextResponse.json(result);
}
