import { prisma } from "database";

export type QuizTopicNav = { slug: string; label: string };

export type QuizListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  topicSlug: string;
  topicLabel: string;
  questionCount: number;
};

export type QuizPlayPayload = {
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
  }[];
};

export async function getQuizTopics(): Promise<QuizTopicNav[]> {
  const rows = await prisma.quiz.groupBy({
    by: ["topicSlug", "topicLabel"],
    where: { published: true },
  });
  return rows
    .map((r) => ({ slug: r.topicSlug, label: r.topicLabel }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function listQuizzes(topicSlug?: string): Promise<QuizListItem[]> {
  const quizzes = await prisma.quiz.findMany({
    where: {
      published: true,
      ...(topicSlug ? { topicSlug } : {}),
    },
    orderBy: [{ topicLabel: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      emoji: true,
      topicSlug: true,
      topicLabel: true,
      _count: { select: { questions: true } },
    },
  });
  return quizzes.map((q) => ({
    id: q.id,
    slug: q.slug,
    title: q.title,
    description: q.description,
    emoji: q.emoji,
    topicSlug: q.topicSlug,
    topicLabel: q.topicLabel,
    questionCount: q._count.questions,
  }));
}

export async function getQuizForPlay(slug: string): Promise<QuizPlayPayload | null> {
  const quiz = await prisma.quiz.findFirst({
    where: { slug, published: true },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" }, select: { id: true, text: true } },
        },
      },
    },
  });
  if (!quiz || quiz.questions.length === 0) return null;
  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    emoji: quiz.emoji,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}
