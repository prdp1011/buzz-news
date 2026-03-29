import { redirect } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "database";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ q?: string; quizId?: string; sectionId?: string; page?: string }>;
};

function buildQuery(base: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  Object.entries(base).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default async function QuizQuestionsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const quizIdFilter = (sp.quizId ?? "").trim() || undefined;
  const sectionIdFilter = (sp.sectionId ?? "").trim() || undefined;
  const pageRaw = parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const and: Prisma.QuizQuestionWhereInput[] = [];
  if (q) {
    and.push({
      OR: [
        { text: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (quizIdFilter) and.push({ quizId: quizIdFilter });
  if (sectionIdFilter) and.push({ quiz: { sectionId: sectionIdFilter } });

  const where: Prisma.QuizQuestionWhereInput =
    and.length > 0 ? { AND: and } : {};

  const [total, questions, quizzes, sections] = await Promise.all([
    prisma.quizQuestion.count({ where }),
    prisma.quizQuestion.findMany({
      where,
      orderBy: [{ quiz: { title: "asc" } }, { order: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        quiz: {
          select: { id: true, title: true, slug: true, section: { select: { label: true } } },
        },
        options: { orderBy: { order: "asc" } },
      },
    }),
    prisma.quiz.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.quizSection.findMany({
      orderBy: { label: "asc" },
      select: { id: true, label: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const queryBase = { q: q || undefined, quizId: quizIdFilter, sectionId: sectionIdFilter };

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Questions</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Search and filter all quiz questions. Edit stem text, optional description, and four
              options (one correct).
            </p>
          </div>
          <Link
            href="/quiz-questions/new"
            className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Add question
          </Link>
        </div>

        <form
          method="get"
          className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:flex-row md:flex-wrap md:items-end"
        >
          <div className="min-w-[200px] flex-1">
            <label className="block text-xs font-medium text-zinc-500">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Question or description…"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="w-full min-w-[160px] md:w-48">
            <label className="block text-xs font-medium text-zinc-500">Quiz</label>
            <select
              name="quizId"
              defaultValue={quizIdFilter ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="">All quizzes</option>
              {quizzes.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.title}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full min-w-[160px] md:w-48">
            <label className="block text-xs font-medium text-zinc-500">Section</label>
            <select
              name="sectionId"
              defaultValue={sectionIdFilter ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
            >
              Apply
            </button>
            <Link
              href="/quiz-questions"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Reset
            </Link>
          </div>
        </form>

        <p className="text-sm text-zinc-500">
          {total} question{total !== 1 ? "s" : ""}
          {total > 0
            ? ` · showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`
            : ""}
        </p>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Question</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Quiz / section</th>
                <th className="px-3 py-3">Options</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {questions.map((row) => (
                <tr key={row.id} className="border-b border-zinc-800/80 align-top last:border-0">
                  <td className="px-3 py-3 text-zinc-500">{row.order}</td>
                  <td className="max-w-[240px] px-3 py-3 text-zinc-200">
                    <span className="line-clamp-3">{row.text}</span>
                  </td>
                  <td className="max-w-[180px] px-3 py-3 text-zinc-500">
                    {row.description ? (
                      <span className="line-clamp-2">{row.description}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-zinc-400">
                    <div className="font-medium text-zinc-300">{row.quiz.title}</div>
                    <div className="text-xs text-zinc-500">{row.quiz.section.label}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-500">
                    <ul className="space-y-0.5">
                      {row.options.map((o) => (
                        <li key={o.id} className={o.isCorrect ? "text-emerald-400" : ""}>
                          {o.isCorrect ? "✓ " : "· "}
                          <span className="line-clamp-1">{o.text}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/quiz-questions/${row.id}`}
                      className="text-cyan-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {questions.length === 0 && (
            <p className="p-8 text-center text-sm text-zinc-500">No questions match your filters.</p>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={`/quiz-questions${buildQuery({ ...queryBase, page: String(page - 1) })}`}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-lg px-4 py-2 text-sm text-zinc-600">Previous</span>
            )}
            <span className="px-2 text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/quiz-questions${buildQuery({ ...queryBase, page: String(page + 1) })}`}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-lg px-4 py-2 text-sm text-zinc-600">Next</span>
            )}
          </nav>
        )}
      </div>
    </AdminLayout>
  );
}
