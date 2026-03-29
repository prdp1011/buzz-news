import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuizMeta } from "@/lib/quiz";
import { SITE_NAME } from "@/lib/seo";
import { QuizResumeRedirect } from "./QuizResumeRedirect";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizMeta(slug);
  if (!quiz) return { title: "Quiz" };
  return {
    title: quiz.title,
    description: quiz.description ?? `Play ${quiz.title} on ${SITE_NAME}.`,
  };
}

export default async function QuizSlugPage({ params }: Props) {
  const { slug } = await params;
  const meta = await getQuizMeta(slug);
  if (!meta) notFound();

  return <QuizResumeRedirect slug={slug} totalQuestions={meta.totalQuestions} />;
}
