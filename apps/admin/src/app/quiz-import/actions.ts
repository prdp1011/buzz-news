"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  readSectionIndex,
  writeSectionIndex,
  writeQuizFile,
  type QuizFileData,
  type SectionIndexRow,
} from "@/lib/quiz-file-store";

export async function updateSectionCoverImage(slug: string, imageUrl: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const normalized = slug.trim().toLowerCase().replace(/\s+/g, "-");
  const url = imageUrl.trim();
  if (!url) return { ok: false as const, error: "URL is empty" };

  const idx = await readSectionIndex();
  const row = idx.sections.find((s) => s.slug === normalized);
  if (!row) return { ok: false as const, error: "Section not found in section.json" };

  row.coverImageUrl = url;
  await writeSectionIndex(idx);

  revalidatePath("/quiz-import");
  revalidatePath("/quiz-data");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

type QuestionIn = {
  order?: unknown;
  text?: unknown;
  description?: unknown;
  options?: unknown;
};
type QuizIn = {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  emoji?: unknown;
  published?: unknown;
  questions?: unknown;
};
type SectionIn = {
  slug?: unknown;
  label?: unknown;
  coverImageUrl?: unknown;
  quizzes?: unknown;
};
type RootIn = { sections?: unknown };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateOptions(
  options: unknown
): { ok: true; options: { text: string; isCorrect: boolean }[] } | { ok: false; error: string } {
  if (!Array.isArray(options)) return { ok: false, error: 'Each question needs an "options" array.' };
  if (options.length !== 4) return { ok: false, error: "Each question must have exactly 4 options." };
  const out: { text: string; isCorrect: boolean }[] = [];
  let correctCount = 0;
  for (let i = 0; i < 4; i++) {
    const o = options[i];
    if (!isObj(o)) return { ok: false, error: `Option ${i + 1} must be an object with text and isCorrect.` };
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!text) return { ok: false, error: `Option ${i + 1} text is required.` };
    const isCorrect = o.isCorrect === true;
    if (isCorrect) correctCount++;
    out.push({ text, isCorrect });
  }
  if (correctCount !== 1) {
    return { ok: false, error: 'Each question must have exactly one option with "isCorrect": true.' };
  }
  return { ok: true, options: out };
}

function normalizeSlug(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function importQuizJson(rawJson: string): Promise<
  { ok: true; summary: string } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Unauthorized" };

  let root: unknown;
  try {
    root = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "Invalid JSON — check commas and quotes." };
  }

  if (!isObj(root)) return { ok: false, error: "Root must be a JSON object." };
  const data = root as RootIn;
  if (!Array.isArray(data.sections)) return { ok: false, error: 'Missing "sections" array.' };
  if (data.sections.length === 0) return { ok: false, error: '"sections" is empty.' };

  const sections: SectionIn[] = data.sections;
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    if (!isObj(sec)) return { ok: false, error: `Section ${si + 1} must be an object.` };
    const slug = typeof sec.slug === "string" ? normalizeSlug(sec.slug) : "";
    const label = typeof sec.label === "string" ? sec.label.trim() : "";
    if (!slug || !label) return { ok: false, error: `Section ${si + 1}: "slug" and "label" are required.` };
    if (!Array.isArray(sec.quizzes)) return { ok: false, error: `Section "${slug}": missing "quizzes" array.` };

    for (let qi = 0; qi < sec.quizzes.length; qi++) {
      const qz = sec.quizzes[qi];
      if (!isObj(qz)) return { ok: false, error: `Quiz ${qi + 1} in section "${slug}" must be an object.` };
      const qSlug = typeof qz.slug === "string" ? normalizeSlug(qz.slug) : "";
      const title = typeof qz.title === "string" ? qz.title.trim() : "";
      if (!qSlug || !title) {
        return { ok: false, error: `Section "${slug}", quiz ${qi + 1}: "slug" and "title" are required.` };
      }
      if (!Array.isArray(qz.questions)) {
        return { ok: false, error: `Quiz "${qSlug}": missing "questions" array.` };
      }
      if (qz.questions.length === 0) {
        return { ok: false, error: `Quiz "${qSlug}" must have at least one question.` };
      }

      for (let hi = 0; hi < qz.questions.length; hi++) {
        const qu = qz.questions[hi] as QuestionIn;
        if (!isObj(qu)) return { ok: false, error: `Quiz "${qSlug}", question ${hi + 1}: must be an object.` };
        const qtext = typeof qu.text === "string" ? qu.text.trim() : "";
        if (!qtext) return { ok: false, error: `Quiz "${qSlug}", question ${hi + 1}: "text" is required.` };
        const optRes = validateOptions(qu.options);
        if (!optRes.ok) return { ok: false, error: `Quiz "${qSlug}", question ${hi + 1}: ${optRes.error}` };
      }
    }
  }

  try {
    const currentIndex = await readSectionIndex();
    const sectionMap = new Map(currentIndex.sections.map((s) => [s.slug, { ...s }]));

    const importSectionOrder: string[] = [];

    for (const sec of sections) {
      const s = sec as SectionIn;
      const secSlug = normalizeSlug(String(s.slug));
      const label = String(s.label).trim();
      const coverRaw = s.coverImageUrl;
      const coverFromImport =
        coverRaw === undefined
          ? undefined
          : coverRaw === null
            ? null
            : typeof coverRaw === "string"
              ? coverRaw.trim() || null
              : null;

      const prev = sectionMap.get(secSlug);
      const coverImageUrl =
        coverFromImport !== undefined && coverFromImport !== null
          ? String(coverFromImport).trim()
          : prev?.coverImageUrl ?? "";

      const defaultDesc = `Master ${label.replace(/\s+Quiz$/i, "").trim() || label} with practical and engaging questions.`;

      sectionMap.set(secSlug, {
        slug: secSlug,
        label,
        emoji: prev?.emoji ?? "\ud83c\udfaf",
        coverImageUrl,
        description: prev?.description ?? defaultDesc,
      });

      if (!importSectionOrder.includes(secSlug)) importSectionOrder.push(secSlug);

      const quizzes = Array.isArray(s.quizzes) ? s.quizzes : [];
      for (const qz of quizzes) {
        const z = qz as QuizIn;
        const qSlug = normalizeSlug(String(z.slug));
        const title = String(z.title).trim();
        const description = typeof z.description === "string" ? z.description.trim() : "";
        const emoji = typeof z.emoji === "string" ? z.emoji.trim() : "\ud83c\udfaf";
        const published = z.published !== false;
        const questionsArr = Array.isArray(z.questions) ? z.questions : [];

        const questions = questionsArr.map((qu, i) => {
          const q = qu as QuestionIn;
          const qtext = String(q.text).trim();
          const qdesc = typeof q.description === "string" ? q.description.trim() : "";
          const order = typeof q.order === "number" && Number.isFinite(q.order) ? q.order : i;
          const optRes = validateOptions(q.options);
          if (!optRes.ok) throw new Error(optRes.error);
          return {
            order,
            text: qtext,
            description: qdesc,
            options: optRes.options,
          };
        });

        questions.sort((a, b) => a.order - b.order);
        const normalizedQuestions = questions.map((q, i) => ({
          order: i,
          text: q.text,
          description: q.description,
          options: q.options,
        }));

        const quizOut: QuizFileData = {
          slug: qSlug,
          title,
          description,
          emoji,
          published,
          questions: normalizedQuestions,
        };
        await writeQuizFile(quizOut);

        if (qSlug !== secSlug && !sectionMap.has(qSlug)) {
          sectionMap.set(qSlug, {
            slug: qSlug,
            label: title,
            emoji,
            coverImageUrl: "",
            description: description || defaultDesc,
          });
          importSectionOrder.push(qSlug);
        }
      }
    }

    const nextSections: SectionIndexRow[] = [];
    const seen = new Set<string>();
    for (const sl of importSectionOrder) {
      const row = sectionMap.get(sl);
      if (row && !seen.has(sl)) {
        seen.add(sl);
        nextSections.push(row);
      }
    }
    for (const s of currentIndex.sections) {
      if (!seen.has(s.slug)) {
        const row = sectionMap.get(s.slug);
        if (row) nextSections.push(row);
      }
    }

    await writeSectionIndex({ sections: nextSections });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import failed";
    return { ok: false, error: msg };
  }

  revalidatePath("/quiz-import");
  revalidatePath("/quiz-data");
  revalidatePath("/", "layout");

  const sectionCount = sections.length;
  const quizCount = sections.reduce(
    (n, s) => n + (Array.isArray(s.quizzes) ? s.quizzes.length : 0),
    0
  );
  const questionCount = sections.reduce((n, s) => {
    const qs = Array.isArray(s.quizzes) ? s.quizzes : [];
    return (
      n +
      qs.reduce(
        (m, q) => m + (isObj(q) && Array.isArray(q.questions) ? q.questions.length : 0),
        0
      )
    );
  }, 0);

  return {
    ok: true,
    summary: `Wrote ${sectionCount} section(s) into section.json, ${quizCount} quiz file(s) under section-wise-question/, ${questionCount} question(s) total.`,
  };
}
