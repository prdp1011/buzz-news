import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { createQuizQuestion } from "../actions";

export default async function NewQuizQuestionPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const quizzes = await prisma.quiz.findMany({
    orderBy: [{ section: { label: "asc" } }, { title: "asc" }],
    select: { id: true, title: true, section: { select: { label: true } } },
  });

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/quiz-questions" className="text-sm text-zinc-500 hover:text-cyan-400">
          ← Questions
        </Link>
        <h1 className="text-2xl font-bold">Add question</h1>

        <form action={createQuizQuestion} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div>
            <label className="block text-xs font-medium text-zinc-500">Quiz</label>
            <select
              name="quizId"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="">Select quiz…</option>
              {quizzes.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.section.label} — {z.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500">Order (optional)</label>
            <input
              name="order"
              type="number"
              min={0}
              placeholder="Append at end if empty"
              className="mt-1 w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500">Question text</label>
            <textarea
              name="text"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500">
              Description (optional)
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Extra context, hint, or internal note"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-zinc-300">Four options</legend>
            <p className="text-xs text-zinc-500">Choose which option is the correct answer.</p>
            <div className="flex flex-wrap gap-4">
              {[0, 1, 2, 3].map((i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <input type="radio" name="correctOption" value={String(i)} defaultChecked={i === 0} />
                  #{i + 1} correct
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  name={`option_${i}`}
                  required
                  placeholder={`Option ${i + 1} text`}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Create question
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
