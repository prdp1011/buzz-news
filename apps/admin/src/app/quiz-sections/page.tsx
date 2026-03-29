import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { createQuizSection } from "./actions";

export default async function QuizSectionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sections = await prisma.quizSection.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { quizzes: true } } },
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Sections</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Each section can have a cover image for the public section page. Quizzes do not use
            images — only emoji/title in listings.
          </p>
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold text-zinc-200">Add section</h2>
          <form action={createQuizSection} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-500">Slug (URL)</label>
              <input
                name="slug"
                required
                placeholder="e.g. science"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500">Label</label>
              <input
                name="label"
                required
                placeholder="Display name"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500">
                Cover image URL (optional)
              </label>
              <input
                name="coverImageUrl"
                type="url"
                placeholder="https://…"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
              >
                Create section
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">All sections</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Quizzes</th>
                  <th className="px-4 py-3">Cover</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-800/80 last:border-0">
                    <td className="px-4 py-3 font-medium text-zinc-200">{s.label}</td>
                    <td className="px-4 py-3 text-zinc-500">{s.slug}</td>
                    <td className="px-4 py-3 text-zinc-400">{s._count.quizzes}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {s.coverImageUrl ? "Yes" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/quiz-sections/${s.id}`}
                        className="text-cyan-400 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sections.length === 0 && (
              <p className="p-6 text-center text-sm text-zinc-500">No sections yet.</p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
