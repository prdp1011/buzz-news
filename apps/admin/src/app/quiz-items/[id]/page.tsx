import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { updateQuizItem } from "../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditQuizItemPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [quiz, sections] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id },
      include: { section: true },
    }),
    prisma.quizSection.findMany({ orderBy: { label: "asc" } }),
  ]);
  if (!quiz) notFound();

  return (
    <AdminLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/quiz-items" className="text-sm text-zinc-500 hover:text-cyan-400">
          ← Quizzes
        </Link>
        <h1 className="text-2xl font-bold">Edit quiz</h1>
        <p className="text-sm text-zinc-500">
          Slug: <code className="text-zinc-400">{quiz.slug}</code> (change via DB if needed)
        </p>

        <form action={updateQuizItem} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <input type="hidden" name="id" value={quiz.id} />
          <div>
            <label className="block text-xs font-medium text-zinc-500">Title</label>
            <input
              name="title"
              required
              defaultValue={quiz.title}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={quiz.description ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">Emoji</label>
            <input
              name="emoji"
              defaultValue={quiz.emoji ?? ""}
              className="mt-1 w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">Section</label>
            <select
              name="sectionId"
              required
              defaultValue={quiz.sectionId}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="published" defaultChecked={quiz.published} />
            Published
          </label>
          <button
            type="submit"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Save
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
