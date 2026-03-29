import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getQuizForPlay } from "@/lib/quiz";
import { SITE_NAME } from "@/lib/seo";
import { QuizPlayer } from "./QuizPlayer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizForPlay(slug);
  if (!quiz) return { title: "Quiz" };
  return {
    title: quiz.title,
    description: quiz.description ?? `Play ${quiz.title} on ${SITE_NAME}.`,
  };
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const quiz = await getQuizForPlay(slug);
  if (!quiz) notFound();

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-amber-400"
      >
        ← All quizzes
      </Link>
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-3xl" aria-hidden>
            {quiz.emoji ?? "❓"}
          </span>
          <h1 className="text-2xl font-bold text-zinc-100">{quiz.title}</h1>
        </div>
        {quiz.description && (
          <p className="text-sm text-zinc-500">{quiz.description}</p>
        )}
      </header>
      <QuizPlayer quiz={quiz} />
    </div>
  );
}
