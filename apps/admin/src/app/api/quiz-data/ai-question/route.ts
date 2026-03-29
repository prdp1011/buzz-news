import { NextResponse } from "next/server";
import { generateQuizMcqQuestion } from "ai-module";
import { getSession } from "@/lib/auth";
import { readQuizFile } from "@/lib/quiz-file-store";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  const hint = typeof b.hint === "string" ? b.hint.trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const quiz = await readQuizFile(slug);
  const gen = await generateQuizMcqQuestion({
    topicHint: hint || quiz?.title || slug,
    quizTitle: quiz?.title,
    quizDescription: quiz?.description,
  });

  if (!gen) {
    return NextResponse.json(
      {
        error:
          "AI question generation needs OPENAI_API_KEY, or the model response was invalid. Check server env and try again.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true as const, question: gen });
}
