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
  const idx = Number.parseInt(questionNum, 10);
  const human = Number.isFinite(idx) && idx >= 0 ? idx + 1 : questionNum;
  return {
    title: `${quiz.title} · Question ${human}`,
    description: quiz.description ?? `Play ${quiz.title} on ${SITE_NAME}.`,
  };
}

export default async function QuizQuestionPage({ params }: Props) {
  const { slug, questionNum } = await params;
  const meta = await getQuizMeta(slug);
  if (!meta) notFound();

  const n = Number.parseInt(questionNum, 10);
  const last = meta.totalQuestions - 1;
  if (!Number.isFinite(n) || n < 0) redirect(`/quiz/${slug}/0`);
  if (n > last) redirect(`/quiz/${slug}/${Math.max(0, last)}`);

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-amber-400"
      >
        ← All quizzes
      </Link>
      <QuizPlayer slug={slug} questionIndex={n} meta={meta} />
    </div>
  );
}
