import fs from "node:fs/promises";
import path from "node:path";

/**
 * Data layout:
 *
 *   data/section.json → { "sections": [ { slug, label, emoji, coverImageUrl, description } ] }
 *   data/section-wise-question/{slug}.json → one quiz (root): slug, title, description, emoji, published, questions[]
 *
 * Quiz URL slug matches section slug and filename (e.g. general-knowledge.json → /quiz/general-knowledge).
 */

const DATA_DIR = path.join(process.cwd(), "data");
const SECTION_INDEX_PATH = path.join(DATA_DIR, "section.json");
const SECTION_WISE_DIR = path.join(DATA_DIR, "section-wise-question");

type QuizOptionJson = {
  id?: string;
  text: string;
  isCorrect?: boolean;
};

type QuizQuestionJson = {
  id?: string;
  order?: number;
  text: string;
  description?: string | null;
  options: QuizOptionJson[];
};

type QuizFileJson = {
  slug?: string;
  title: string;
  description?: string | null;
  emoji?: string | null;
  published?: boolean;
  questions: QuizQuestionJson[];
};

export type NormalizedQuiz = {
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  published: boolean;
  questions: {
    id: string;
    text: string;
    description: string | null;
    options: { id: string; text: string; isCorrect: boolean }[];
  }[];
};

type SectionIndexEntry = {
  slug: string;
  label: string;
  emoji: string | null;
  coverImageUrl: string | null;
  description: string | null;
};

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null || s === "") return null;
  return s;
}

function humanLabel(slug: string): string {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeQuiz(raw: unknown, fileSlug: string): NormalizedQuiz | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as QuizFileJson;
  if (!q.title || !Array.isArray(q.questions)) return null;

  const questions = [...q.questions].sort((a, b) => {
    const ao = typeof a.order === "number" ? a.order : 0;
    const bo = typeof b.order === "number" ? b.order : 0;
    return ao - bo;
  });

  const normQuestions: NormalizedQuiz["questions"] = [];

  for (let qi = 0; qi < questions.length; qi++) {
    const qq = questions[qi];
    if (!qq || typeof qq.text !== "string" || !Array.isArray(qq.options)) continue;
    const slugBase =
      typeof q.slug === "string" && q.slug.length > 0 ? q.slug : fileSlug;
    const qid =
      typeof qq.id === "string" && qq.id.length > 0 ? qq.id : `${slugBase}-q${qi + 1}`;
    const opts: NormalizedQuiz["questions"][0]["options"] = [];
    for (let oi = 0; oi < qq.options.length; oi++) {
      const o = qq.options[oi];
      if (!o || typeof o.text !== "string") continue;
      const oid =
        typeof o.id === "string" && o.id.length > 0
          ? o.id
          : `${slugBase}-q${qi + 1}-o${oi + 1}`;
      opts.push({
        id: oid,
        text: o.text,
        isCorrect: Boolean(o.isCorrect),
      });
    }
    if (opts.length === 0) continue;
    normQuestions.push({
      id: qid,
      text: qq.text,
      description: qq.description ?? null,
      options: opts,
    });
  }

  if (normQuestions.length === 0) return null;

  return {
    slug: fileSlug,
    title: q.title,
    description: q.description ?? null,
    emoji: q.emoji ?? null,
    published: q.published !== false,
    questions: normQuestions,
  };
}

async function readSectionIndex(): Promise<SectionIndexEntry[]> {
  try {
    const raw = await fs.readFile(SECTION_INDEX_PATH, "utf8");
    const j = JSON.parse(raw) as { sections?: unknown };
    if (!Array.isArray(j.sections)) return [];
    const out: SectionIndexEntry[] = [];
    for (const row of j.sections) {
      if (!row || typeof row !== "object") continue;
      const r = row as {
        slug?: string;
        label?: string;
        emoji?: string;
        coverImageUrl?: string;
        description?: string;
      };
      if (typeof r.slug !== "string" || !r.slug) continue;
      out.push({
        slug: r.slug,
        label: typeof r.label === "string" && r.label ? r.label : humanLabel(r.slug),
        emoji: typeof r.emoji === "string" && r.emoji ? r.emoji : null,
        coverImageUrl: emptyToNull(r.coverImageUrl ?? null),
        description: typeof r.description === "string" ? r.description : null,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function listSectionWiseJsonFiles(): Promise<string[]> {
  try {
    const names = await fs.readdir(SECTION_WISE_DIR);
    return names.filter((n) => n.endsWith(".json"));
  } catch {
    return [];
  }
}

async function loadQuizFromSectionFile(sectionSlug: string): Promise<NormalizedQuiz | null> {
  const fp = path.join(SECTION_WISE_DIR, `${sectionSlug}.json`);
  let raw: string;
  try {
    raw = await fs.readFile(fp, "utf8");
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  if (!Array.isArray((parsed as QuizFileJson).questions)) return null;
  return normalizeQuiz(parsed, sectionSlug);
}

type QuizListRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  sectionSlug: string;
  sectionLabel: string;
  questionCount: number;
  mtimeMs: number;
};

async function collectQuizRows(): Promise<QuizListRow[]> {
  const index = await readSectionIndex();
  const rows: QuizListRow[] = [];

  const slugsToScan =
    index.length > 0
      ? index.map((s) => s.slug)
      : (await listSectionWiseJsonFiles()).map((f) => path.basename(f, ".json"));

  const labelBySlug = new Map(index.map((s) => [s.slug, s.label]));

  for (const sectionSlug of slugsToScan) {
    const fp = path.join(SECTION_WISE_DIR, `${sectionSlug}.json`);
    let mtimeMs = Date.now();
    try {
      mtimeMs = (await fs.stat(fp)).mtimeMs;
    } catch {
      continue;
    }

    const quiz = await loadQuizFromSectionFile(sectionSlug);
    if (!quiz || !quiz.published) continue;

    const sectionLabel = labelBySlug.get(sectionSlug) ?? humanLabel(sectionSlug);
    rows.push({
      id: quiz.slug,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      emoji: quiz.emoji,
      sectionSlug,
      sectionLabel,
      questionCount: quiz.questions.length,
      mtimeMs,
    });
  }

  return rows;
}

async function findQuiz(quizSlug: string): Promise<NormalizedQuiz | null> {
  return loadQuizFromSectionFile(quizSlug);
}

export type QuizSectionRow = {
  slug: string;
  label: string;
  emoji?: string;
  description?: string;
  coverImageUrl?: string | null;
};

export async function dbGetQuizSections(): Promise<QuizSectionRow[]> {
  const idx = await readSectionIndex();
  if (idx.length === 0) {
    const files = await listSectionWiseJsonFiles();
    return files
      .map((f) => path.basename(f, ".json"))
      .sort()
      .map((slug) => ({ slug, label: humanLabel(slug) }));
  }
  return idx.map((s) => ({
    slug: s.slug,
    label: s.label,
    ...(s.emoji ? { emoji: s.emoji } : {}),
    ...(s.description ? { description: s.description } : {}),
    coverImageUrl: s.coverImageUrl,
  }));
}

export async function dbGetQuizSectionsPaginated(opts: { page: number; pageSize: number }) {
  const all = await dbGetQuizSections();
  const page = Math.max(1, Math.floor(opts.page));
  const pageSize = Math.min(48, Math.max(1, Math.floor(opts.pageSize)));
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = all.slice((safePage - 1) * pageSize, safePage * pageSize);
  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function dbListSidebarQuizzes() {
  const rows = await collectQuizRows();
  const sorted = [...rows].sort((a, b) => b.mtimeMs - a.mtimeMs).slice(0, 6);
  return sorted.map((r) => ({
    slug: r.slug,
    title: r.title,
    emoji: r.emoji,
  }));
}

export async function dbGetSitemapQuizData() {
  const rows = await collectQuizRows();
  return {
    quizzes: rows.map((r) => ({
      slug: r.slug,
      updatedAt: new Date(r.mtimeMs).toISOString(),
    })),
  };
}

export async function dbGetQuizMeta(slug: string) {
  const quiz = await findQuiz(slug);
  if (!quiz) return null;
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    emoji: quiz.emoji,
    totalQuestions: quiz.questions.length,
  };
}

export async function dbGetQuizQuestionByIndex(slug: string, questionIndex: number) {
  const quiz = await findQuiz(slug);
  if (!quiz) return null;
  if (questionIndex < 0 || questionIndex >= quiz.questions.length) return null;
  const question = quiz.questions[questionIndex];
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    emoji: quiz.emoji,
    index: questionIndex,
    displayNumber: questionIndex + 1,
    total: quiz.questions.length,
    question: {
      id: question.id,
      text: question.text,
      options: question.options.map((o) => ({ id: o.id, text: o.text })),
    },
  };
}

export async function dbCheckQuestionAnswer(
  quizSlug: string,
  questionIndex: number,
  selectedOptionId: string,
): Promise<{
  wasRight: boolean;
  correctOptionId: string;
  explanation: string | null;
} | null> {
  const quiz = await findQuiz(quizSlug);
  if (!quiz || questionIndex < 0 || questionIndex >= quiz.questions.length) return null;
  const question = quiz.questions[questionIndex];
  const correctOpt = question.options.find((o) => o.isCorrect);
  const correctOptionId = correctOpt?.id ?? "";
  const wasRight = Boolean(correctOpt && selectedOptionId === correctOpt.id);
  return {
    wasRight,
    correctOptionId,
    explanation: question.description,
  };
}

export type GradeDetailRow = {
  questionId: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  pickedOptionId: string | null;
  wasRight: boolean;
  explanation: string | null;
};

export async function dbGradeQuiz(
  quizSlug: string,
  answers: Record<string, string | undefined | null>,
): Promise<{ correct: number; total: number; details: GradeDetailRow[] } | null> {
  const quiz = await findQuiz(quizSlug);
  if (!quiz) return null;

  let correct = 0;
  const details: GradeDetailRow[] = [];

  for (const q of quiz.questions) {
    const correctOpt = q.options.find((o) => o.isCorrect);
    const correctOptionId = correctOpt?.id ?? "";
    const raw = answers[q.id];
    const picked = typeof raw === "string" && raw.length > 0 ? raw : null;
    const wasRight = Boolean(picked && correctOpt && picked === correctOpt.id);
    if (wasRight) correct++;
    details.push({
      questionId: q.id,
      questionText: q.text,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctOptionId,
      pickedOptionId: picked,
      wasRight,
      explanation: q.description,
    });
  }

  return {
    correct,
    total: quiz.questions.length,
    details,
  };
}
