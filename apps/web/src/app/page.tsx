import { listQuizzes } from "@/lib/quiz";
import { QuizCard } from "@/components/QuizCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse trivia quizzes by topic. Multiple choice, instant scoring — no account required.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const quizzes = await listQuizzes();

  return (
    <div>
      <section className="mb-8 px-0 pt-0 md:mb-10">
        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-zinc-100 md:text-2xl">
          Pick a quiz <span className="text-amber-400">🧠</span>
        </h1>
        <p className="text-sm text-zinc-500 md:text-base">
          One question at a time, four choices each — finish and see how you did.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
      {quizzes.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-zinc-500 text-sm md:py-24 md:text-base">
          No quizzes yet. Run <code className="text-zinc-400">pnpm db:seed</code> to load sample data.
        </div>
      )}
    </div>
  );
}
