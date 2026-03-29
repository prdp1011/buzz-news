import Link from "next/link";
import type { QuizListItem } from "@/lib/quiz";

export function QuizCard({ quiz }: { quiz: QuizListItem }) {
  return (
    <Link
      href={`/quiz/${quiz.slug}`}
      className="group block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-amber-500/40 hover:bg-zinc-900/80"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden>
          {quiz.emoji ?? "❓"}
        </span>
        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
          {quiz.questionCount} questions
        </span>
      </div>
      <h2 className="text-lg font-bold text-zinc-100 group-hover:text-amber-400">
        {quiz.title}
      </h2>
      {quiz.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{quiz.description}</p>
      )}
    </Link>
  );
}
