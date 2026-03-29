"use server";

import { prisma } from "database";

export type GradeResult = {
  correct: number;
  total: number;
  details: { questionId: string; correctOptionId: string; pickedOptionId: string | null; wasRight: boolean }[];
};

export async function gradeQuiz(
  quizSlug: string,
  answers: { questionId: string; optionId: string | null }[],
): Promise<GradeResult | { error: string }> {
  const quiz = await prisma.quiz.findFirst({
    where: { slug: quizSlug, published: true },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
  if (!quiz) return { error: "Quiz not found" };

  const answerByQ = new Map(answers.map((a) => [a.questionId, a.optionId]));
  let correct = 0;
  const details: GradeResult["details"] = [];

  for (const q of quiz.questions) {
    const correctOpt = q.options.find((o) => o.isCorrect);
    const correctOptionId = correctOpt?.id ?? "";
    const picked = answerByQ.get(q.id) ?? null;
    const wasRight = Boolean(picked && correctOpt && picked === correctOpt.id);
    if (wasRight) correct++;
    details.push({
      questionId: q.id,
      correctOptionId,
      pickedOptionId: picked,
      wasRight,
    });
  }

  return {
    correct,
    total: quiz.questions.length,
    details,
  };
}
