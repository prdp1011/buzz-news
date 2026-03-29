"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  readQuizFile,
  writeQuizFile,
  readSectionIndex,
  writeSectionIndex,
  type QuizFileData,
  type QuizQuestionRow,
} from "@/lib/quiz-file-store";

function normalizeSlug(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

function validateQuestion(q: QuizQuestionRow): string | null {
  const text = typeof q.text === "string" ? q.text.trim() : "";
  if (!text) return "Question text is required.";
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return "Each question needs exactly 4 options.";
  }
  let correct = 0;
  for (let i = 0; i < 4; i++) {
    const o = q.options[i];
    const t = typeof o?.text === "string" ? o.text.trim() : "";
    if (!t) return `Option ${i + 1} text is required.`;
    if (o.isCorrect === true) correct++;
  }
  if (correct !== 1) return "Exactly one option must be marked correct.";
  return null;
}

export async function saveQuizJsonAction(
  slug: string,
  quiz: QuizFileData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const normalized = normalizeSlug(slug);
  if (normalizeSlug(quiz.slug) !== normalized) {
    return { ok: false, error: "Slug mismatch between URL and payload." };
  }

  for (let i = 0; i < quiz.questions.length; i++) {
    const err = validateQuestion(quiz.questions[i]!);
    if (err) return { ok: false, error: `Question ${i + 1}: ${err}` };
  }

  const normalizedQuiz: QuizFileData = {
    slug: normalized,
    title: quiz.title.trim(),
    description: typeof quiz.description === "string" ? quiz.description.trim() : "",
    emoji: typeof quiz.emoji === "string" ? quiz.emoji.trim() : "🎯",
    published: quiz.published !== false,
    questions: quiz.questions.map((q, i) => ({
      order: i,
      text: q.text.trim(),
      description: typeof q.description === "string" ? q.description.trim() : "",
      options: q.options.map((o) => ({
        text: o.text.trim(),
        isCorrect: o.isCorrect === true,
      })),
    })),
  };

  if (!normalizedQuiz.title) return { ok: false, error: "Quiz title is required." };

  await writeQuizFile(normalizedQuiz);
  revalidatePath("/quiz-data");
  revalidatePath(`/quiz-data/${normalized}`);
  revalidatePath("/quiz-import");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createEmptyQuizAction(
  slug: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const normalized = normalizeSlug(slug);
  const idx = await readSectionIndex();
  const row = idx.sections.find((s) => s.slug === normalized);
  if (!row) return { ok: false, error: "Unknown section slug (not in section.json)." };

  const existing = await readQuizFile(normalized);
  if (existing) return { ok: false, error: "Quiz file already exists." };

  const titleBase = row.label.replace(/\s+Quiz$/i, "").trim() || row.label;
  const quiz: QuizFileData = {
    slug: normalized,
    title: titleBase,
    description: row.description || "",
    emoji: row.emoji || "🎯",
    published: false,
    questions: [],
  };
  await writeQuizFile(quiz);
  revalidatePath("/quiz-data");
  revalidatePath(`/quiz-data/${normalized}`);
  revalidatePath("/quiz-import");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateSectionCardAction(
  slug: string,
  patch: { label?: string; description?: string; emoji?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  const normalized = normalizeSlug(slug);
  const idx = await readSectionIndex();
  const row = idx.sections.find((s) => s.slug === normalized);
  if (!row) return { ok: false, error: "Section not found in section.json." };

  if (typeof patch.label === "string") row.label = patch.label.trim() || row.label;
  if (typeof patch.description === "string") row.description = patch.description.trim();
  if (typeof patch.emoji === "string") row.emoji = patch.emoji.trim() || row.emoji;

  await writeSectionIndex(idx);
  revalidatePath("/quiz-data");
  revalidatePath(`/quiz-data/${normalized}`);
  revalidatePath("/quiz-import");
  revalidatePath("/", "layout");
  return { ok: true };
}
