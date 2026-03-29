import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { updateQuizQuestion, deleteQuizQuestion } from "../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditQuizQuestionPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [question, quizzes] = await Promise.all([
    prisma.quizQuestion.findUnique({
      where: { id },
      include: { options: { orderBy: { order: "asc" } } },
    }),
    prisma.quiz.findMany({
      orderBy: [{ section: { label: "asc" } }, { title: "asc" }],
      select: { id: true, title: true, section: { select: { label: true } } },
    }),
  ]);

  if (!question) notFound();

  const correctIdx = question.options.findIndex((o) => o.isCorrect);
  const safeCorrect = correctIdx >= 0 ? correctIdx : 0;
  const opts = [0, 1, 2, 3].map((i) => question.options[i]?.text ?? "");

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/quiz-questions" className="text-sm text-zinc-500 hover:text-cyan-400">
          ← Questions
        </Link>
        <h1 className="text-2xl font-bold">Edit question</h1>

        <form action={updateQuizQuestion} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <input type="hidden" name="id" value={question.id} />

          <div>
            <label className="block text-xs font-medium text-zinc-500">Quiz</label>
            <select
              name="quizId"
              required
              defaultValue={question.quizId}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              {quizzes.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.section.label} — {z.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500">Order</label>
            <input
              name="order"
              type="number"
              min={0}
              required
              defaultValue={question.order}
              className="mt-1 w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500">Question text</label>
            <textarea
              name="text"
              required
              rows={3}
              defaultValue={question.text}
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
              defaultValue={question.description ?? ""}
              placeholder="Extra context, hint, or internal note"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-zinc-300">Four options</legend>
            <div className="flex flex-wrap gap-4">
              {[0, 1, 2, 3].map((i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="radio"
                    name="correctOption"
                    value={String(i)}
                    defaultChecked={i === safeCorrect}
                  />
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
                  defaultValue={opts[i]}
                  placeholder={`Option ${i + 1} text`}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              Save changes
            </button>
          </div>
        </form>

        <form action={deleteQuizQuestion} className="border-t border-zinc-800 pt-6">
          <input type="hidden" name="id" value={question.id} />
          <button type="submit" className="text-sm text-red-400 hover:text-red-300">
            Delete question
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
