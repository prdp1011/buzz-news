import { listQuizzesPaginated } from "@/lib/quiz";
import { QuizCard } from "@/components/QuizCard";
import { QuizPagination } from "@/components/QuizPagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse latest trivia quizzes. Multiple choice, instant scoring — no account required.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;

  const { items, total, totalPages, page: currentPage } = await listQuizzesPaginated({
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 px-5 py-10 md:px-10 md:py-14">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
          QuizLab
        </p>
        <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-zinc-50 md:text-4xl">
          Latest quizzes
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
          Pick a quiz, answer one question at a time, then see your score — no signup. Use the menu
          to open a section.
        </p>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-bold text-zinc-200">All quizzes</h2>
          <span className="text-xs text-zinc-600">
            {total} total · showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, total) || 0}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-sm text-zinc-500 md:py-24 md:text-base">
            No quizzes yet. Run <code className="text-zinc-400">pnpm db:seed</code> to load sample
            data.
          </div>
        )}
        <QuizPagination page={currentPage} totalPages={totalPages} />
      </section>

      <section className="rounded-xl border border-dashed border-zinc-600/50 bg-zinc-900/20 px-5 py-6 md:px-8 md:py-8">
        <h2 className="text-base font-semibold text-zinc-300">How it works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-500">
          <li>Open the menu (top right) to jump to a section or stay on this list.</li>
          <li>Choose a quiz and tap an answer for each question.</li>
          <li>Finish to see your score and review anything you missed.</li>
        </ol>
      </section>
    </div>
  );
}
