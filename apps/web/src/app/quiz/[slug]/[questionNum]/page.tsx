import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getQuizMeta } from "@/lib/quiz";
import { SITE_NAME } from "@/lib/seo";
import { QuizPlayer } from "../QuizPlayer";

type Props = { params: Promise<{ slug: string; questionNum: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, questionNum } = await params;
  const quiz = await getQuizMeta(slug);
  if (!quiz) return { title: "Quiz" };
  return {
    title: `${quiz.title} · Question ${questionNum}`,
    description: quiz.description ?? `Play ${quiz.title} on ${SITE_NAME}.`,
  };
}

export default async function QuizQuestionPage({ params }: Props) {
  const { slug, questionNum } = await params;
  const meta = await getQuizMeta(slug);
  if (!meta) notFound();

  const n = Number.parseInt(questionNum, 10);
  if (!Number.isFinite(n) || n < 1) redirect(`/quiz/${slug}/1`);
  if (n > meta.totalQuestions) redirect(`/quiz/${slug}/${meta.totalQuestions}`);

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-amber-400"
      >
        ← All quizzes
      </Link>
      <QuizPlayer slug={slug} questionNum={n} meta={meta} />
    </div>
  );
}
