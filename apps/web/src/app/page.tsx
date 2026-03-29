import { getQuizSectionsPaginated } from "@/lib/quiz";
import { SectionCard } from "@/components/SectionCard";
import { ListingPagination } from "@/components/ListingPagination";
import type { Metadata } from "next";

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const raw = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;
  const base = {
    title: "Home",
    description:
      "Browse trivia quizzes by topic. Multiple choice, saved progress in your browser — no account required.",
  };
  if (page <= 1) return base;
  return { ...base, title: `Home · Page ${page}` };
}

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Number.parseInt(sp.page ?? "1", 10);
  const requested = Number.isFinite(raw) && raw >= 1 ? raw : 1;

  const { items: sections, total, page: currentPage, totalPages } =
    await getQuizSectionsPaginated({
      page: requested,
      pageSize: PAGE_SIZE,
    });

  const showingFrom = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, total);

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
          Pick a quiz
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 md:text-base">
          Each topic opens its quiz directly. Your browser remembers where you stopped so you can resume.
        </p>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-bold text-zinc-200">Quizzes</h2>
          {total > 0 && (
            <span className="text-xs text-zinc-600">
              {total} total · showing {showingFrom}–{showingTo}
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <SectionCard key={s.slug} section={s} />
          ))}
        </div>
        {sections.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-sm text-zinc-500 md:py-24 md:text-base">
            Add entries to <code className="text-zinc-400">data/section.json</code> and matching{" "}
            <code className="text-zinc-400">data/section-wise-question/&#123;slug&#125;.json</code> files (one quiz
            per file).
          </div>
        )}
        <ListingPagination page={currentPage} totalPages={totalPages} />
      </section>

      <section className="rounded-xl border border-dashed border-zinc-600/50 bg-zinc-900/20 px-5 py-6 md:px-8 md:py-8">
        <h2 className="text-base font-semibold text-zinc-300">How it works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-500">
          <li>Choose a topic to start its quiz.</li>
          <li>
            Questions use <code className="text-zinc-400">/quiz/&#123;slug&#125;/0</code>, … Opening{" "}
            <code className="text-zinc-400">/quiz/&#123;slug&#125;</code> resumes your last question or starts at{" "}
            <code className="text-zinc-400">0</code>.
          </li>
          <li>Finish to see your score; progress is cleared when you complete a run.</li>
        </ol>
      </section>
    </div>
  );
}
