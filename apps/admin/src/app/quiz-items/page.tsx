import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";

export default async function QuizItemsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const quizzes = await prisma.quiz.findMany({
    orderBy: [{ section: { label: "asc" } }, { title: "asc" }],
    include: { section: { select: { label: true, slug: true } }, _count: { select: { questions: true } } },
  });

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Edit titles, section assignment, and publish state. Questions live under{" "}
            <Link href="/quiz-questions" className="text-cyan-400 hover:underline">
              Questions
            </Link>
            .
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Qs</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3">
                    <span className="mr-2" aria-hidden>
                      {q.emoji ?? "❓"}
                    </span>
                    <span className="font-medium text-zinc-200">{q.title}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{q.section.label}</td>
                  <td className="px-4 py-3 text-zinc-500">{q._count.questions}</td>
                  <td className="px-4 py-3 text-zinc-400">{q.published ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/quiz-items/${q.id}`} className="text-cyan-400 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quizzes.length === 0 && (
            <p className="p-6 text-center text-sm text-zinc-500">No quizzes yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
