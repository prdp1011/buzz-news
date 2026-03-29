"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "database";
import { getSession } from "@/lib/auth";

export async function updateSectionCoverImage(sectionId: string, imageUrl: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const url = imageUrl.trim();
  if (!url) return { ok: false as const, error: "URL is empty" };

  await prisma.quizSection.update({
    where: { id: sectionId },
    data: { coverImageUrl: url },
  });

  revalidatePath("/quiz-import");
  revalidatePath("/quiz-sections");
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

function validateOptions(options: unknown): { ok: true; options: { text: string; isCorrect: boolean }[] } | { ok: false; error: string } {
  if (!Array.isArray(options)) return { ok: false, error: "Each question needs an \"options\" array." };
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
  if (correctCount !== 1) return { ok: false, error: "Each question must have exactly one option with \"isCorrect\": true." };
  return { ok: true, options: out };
}

export async function importQuizJson(rawJson: string): Promise<
  | { ok: true; summary: string }
  | { ok: false; error: string }
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
  if (!Array.isArray(data.sections)) return { ok: false, error: "Missing \"sections\" array." };
  if (data.sections.length === 0) return { ok: false, error: "\"sections\" is empty." };

  const sections: SectionIn[] = data.sections;
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    if (!isObj(sec)) return { ok: false, error: `Section ${si + 1} must be an object.` };
    const slug = typeof sec.slug === "string" ? sec.slug.trim().toLowerCase().replace(/\s+/g, "-") : "";
    const label = typeof sec.label === "string" ? sec.label.trim() : "";
    if (!slug || !label) return { ok: false, error: `Section ${si + 1}: \"slug\" and \"label\" are required.` };
    if (!Array.isArray(sec.quizzes)) return { ok: false, error: `Section "${slug}": missing \"quizzes\" array.` };

    for (let qi = 0; qi < sec.quizzes.length; qi++) {
      const qz = sec.quizzes[qi];
      if (!isObj(qz)) return { ok: false, error: `Quiz ${qi + 1} in section "${slug}" must be an object.` };
      const qSlug = typeof qz.slug === "string" ? qz.slug.trim().toLowerCase().replace(/\s+/g, "-") : "";
      const title = typeof qz.title === "string" ? qz.title.trim() : "";
      if (!qSlug || !title) {
        return { ok: false, error: `Section "${slug}", quiz ${qi + 1}: \"slug\" and \"title\" are required.` };
      }
      if (!Array.isArray(qz.questions)) {
        return { ok: false, error: `Quiz "${qSlug}": missing \"questions\" array.` };
      }
      if (qz.questions.length === 0) {
        return { ok: false, error: `Quiz "${qSlug}\" must have at least one question.` };
      }

      for (let hi = 0; hi < qz.questions.length; hi++) {
        const qu = qz.questions[hi] as QuestionIn;
        if (!isObj(qu)) return { ok: false, error: `Quiz "${qSlug}", question ${hi + 1}: must be an object.` };
        const qtext = typeof qu.text === "string" ? qu.text.trim() : "";
        if (!qtext) return { ok: false, error: `Quiz "${qSlug}", question ${hi + 1}: \"text\" is required.` };
        const optRes = validateOptions(qu.options);
        if (!optRes.ok) return { ok: false, error: `Quiz "${qSlug}", question ${hi + 1}: ${optRes.error}` };
      }
    }
  }

  try {
    await prisma.$transaction(
      async (tx) => {
      for (const sec of sections) {
        const s = sec as SectionIn;
        const slug = String(s.slug).trim().toLowerCase().replace(/\s+/g, "-");
        const label = String(s.label).trim();
        const coverRaw = s.coverImageUrl;
        const coverImageUrl =
          coverRaw === undefined
            ? undefined
            : coverRaw === null
              ? null
              : typeof coverRaw === "string"
                ? coverRaw.trim() || null
                : null;

        const sectionRow = await tx.quizSection.upsert({
          where: { slug },
          create: {
            slug,
            label,
            coverImageUrl: coverImageUrl ?? null,
          },
          update: {
            label,
            ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
          },
        });

        const quizzes = Array.isArray(s.quizzes) ? s.quizzes : [];
        for (const qz of quizzes) {
          const z = qz as QuizIn;
          const qSlug = String(z.slug).trim().toLowerCase().replace(/\s+/g, "-");
          const title = String(z.title).trim();
          const description =
            typeof z.description === "string" ? z.description.trim() || null : null;
          const emoji = typeof z.emoji === "string" ? z.emoji.trim() || null : null;
          const published = z.published !== false;

          const quizRow = await tx.quiz.upsert({
            where: { slug: qSlug },
            create: {
              slug: qSlug,
              title,
              description,
              emoji,
              published,
              sectionId: sectionRow.id,
            },
            update: {
              title,
              description,
              emoji,
              published,
              sectionId: sectionRow.id,
            },
          });

          await tx.quizQuestion.deleteMany({ where: { quizId: quizRow.id } });

          const questions = Array.isArray(z.questions) ? z.questions : [];
          for (let i = 0; i < questions.length; i++) {
            const qu = questions[i] as QuestionIn;
            const qtext = String(qu.text).trim();
            const qdesc =
              typeof qu.description === "string" ? qu.description.trim() || null : null;
            const order =
              typeof qu.order === "number" && Number.isFinite(qu.order) ? qu.order : i;
            const optRes = validateOptions(qu.options);
            if (!optRes.ok) throw new Error(optRes.error);

            await tx.quizQuestion.create({
              data: {
                quizId: quizRow.id,
                order,
                text: qtext,
                description: qdesc,
                options: {
                  create: optRes.options.map((o, j) => ({
                    order: j,
                    text: o.text,
                    isCorrect: o.isCorrect,
                  })),
                },
              },
            });
          }
        }
      }
    },
      {
        maxWait: 15_000,
        timeout: 120_000,
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import failed";
    return { ok: false, error: msg };
  }

  revalidatePath("/quiz-import");
  revalidatePath("/quiz-sections");
  revalidatePath("/quiz-items");
  revalidatePath("/quiz-questions");
  revalidatePath("/", "layout");

  const sectionCount = sections.length;
  const quizCount = sections.reduce(
    (n, s) => n + (Array.isArray(s.quizzes) ? s.quizzes.length : 0),
    0,
  );
  const questionCount = sections.reduce((n, s) => {
    const qs = Array.isArray(s.quizzes) ? s.quizzes : [];
    return (
      n +
      qs.reduce((m, q) => m + (isObj(q) && Array.isArray(q.questions) ? q.questions.length : 0), 0)
    );
  }, 0);

  return {
    ok: true,
    summary: `Imported ${sectionCount} section(s), ${quizCount} quiz(zes), ${questionCount} question(s). Existing quizzes were updated; their old questions were replaced.`,
  };
}
