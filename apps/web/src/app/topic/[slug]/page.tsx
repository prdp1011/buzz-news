import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { listQuizzes, getQuizTopics } from "@/lib/quiz";
import { QuizCard } from "@/components/QuizCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topics = await getQuizTopics();
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) return { title: "Topic" };
  return {
    title: topic.label,
    description: `Trivia and quizzes about ${topic.label}.`,
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topics = await getQuizTopics();
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const quizzes = await listQuizzes(slug);

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:text-amber-400">
        ← Home
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-zinc-100">{topic.label}</h1>
      <p className="mb-8 text-sm text-zinc-500">
        {quizzes.length} quiz{quizzes.length === 1 ? "" : "zes"} in this topic
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
      {quizzes.length === 0 && (
        <p className="text-center text-zinc-500">No quizzes here yet.</p>
      )}
    </div>
  );
}
