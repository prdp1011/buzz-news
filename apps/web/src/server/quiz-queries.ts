import { prisma } from "database";

const quizListSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  emoji: true,
  section: { select: { slug: true, label: true } },
  _count: { select: { questions: true } },
} as const;

export async function dbGetQuizSections() {
  return prisma.quizSection.findMany({
    orderBy: { label: "asc" },
    select: { slug: true, label: true },
  });
}

export async function dbListQuizzesPaginated(opts: {
  page: number;
  pageSize: number;
  sectionSlug?: string;
}) {
  const page = Math.max(1, opts.page);
  const pageSize = Math.min(48, Math.max(1, opts.pageSize));
  const where = {
    published: true as const,
    ...(opts.sectionSlug ? { section: { slug: opts.sectionSlug } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.quiz.count({ where }),
    prisma.quiz.findMany({
      where,
      orderBy: [{ section: { label: "asc" } }, { title: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: quizListSelect,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    total,
    page,
    pageSize,
    totalPages,
    items: rows.map((q) => ({
      id: q.id,
      slug: q.slug,
      title: q.title,
      description: q.description,
      emoji: q.emoji,
      sectionSlug: q.section.slug,
      sectionLabel: q.section.label,
      questionCount: q._count.questions,
    })),
  };
}

export async function dbListQuizzes(sectionSlug?: string) {
  const quizzes = await prisma.quiz.findMany({
    where: {
      published: true,
      ...(sectionSlug ? { section: { slug: sectionSlug } } : {}),
    },
    orderBy: [{ section: { label: "asc" } }, { title: "asc" }],
    select: quizListSelect,
  });
  return quizzes.map((q) => ({
    id: q.id,
    slug: q.slug,
    title: q.title,
    description: q.description,
    emoji: q.emoji,
    sectionSlug: q.section.slug,
    sectionLabel: q.section.label,
    questionCount: q._count.questions,
  }));
}

export async function dbGetSectionBySlug(slug: string) {
  return prisma.quizSection.findUnique({
    where: { slug },
    select: { id: true, slug: true, label: true, coverImageUrl: true },
  });
}

export async function dbListSidebarQuizzes() {
  return prisma.quiz.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: { slug: true, title: true, emoji: true },
  });
}

export async function dbGetSitemapQuizData() {
  const [quizzes, sections] = await Promise.all([
    prisma.quiz.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.quizSection.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);
  return { quizzes, sections };
}

export async function dbGetQuizMeta(slug: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { slug, published: true },
    select: {
      slug: true,
      title: true,
      description: true,
      emoji: true,
      _count: { select: { questions: true } },
    },
  });
  if (!quiz || quiz._count.questions === 0) return null;
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    emoji: quiz.emoji,
    totalQuestions: quiz._count.questions,
  };
}

export async function dbGetQuizQuestionByIndex(slug: string, oneBasedIndex: number) {
  const quiz = await prisma.quiz.findFirst({
    where: { slug, published: true },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          options: { orderBy: { order: "asc" }, select: { id: true, text: true } },
        },
      },
    },
  });
  if (!quiz || quiz.questions.length === 0) return null;
  const idx = oneBasedIndex - 1;
  if (idx < 0 || idx >= quiz.questions.length) return null;
  const question = quiz.questions[idx];
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    emoji: quiz.emoji,
    index: oneBasedIndex,
    total: quiz.questions.length,
    question,
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
  const quiz = await prisma.quiz.findFirst({
    where: { slug: quizSlug, published: true },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
        },
      },
    },
  });
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
