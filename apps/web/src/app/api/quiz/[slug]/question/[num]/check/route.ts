import { NextResponse } from "next/server";
import { dbCheckQuestionAnswer } from "@/server/quiz-queries";

type Props = { params: Promise<{ slug: string; num: string }> };

export async function POST(req: Request, { params }: Props) {
  const { slug, num } = await params;
  const qIdx = Number.parseInt(num, 10);
  if (!Number.isFinite(qIdx) || qIdx < 0) {
    return NextResponse.json({ error: "Invalid question index" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const optionId =
    body && typeof body === "object" && body !== null && "optionId" in body
      ? (body as { optionId: unknown }).optionId
      : body && typeof body === "object" && body !== null && "selectedOptionId" in body
        ? (body as { selectedOptionId: unknown }).selectedOptionId
        : undefined;
  if (typeof optionId !== "string" || !optionId) {
    return NextResponse.json({ error: "Missing optionId" }, { status: 400 });
  }

  const result = await dbCheckQuestionAnswer(slug, qIdx, optionId);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
