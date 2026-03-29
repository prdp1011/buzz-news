import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLayout } from "@/components/AdminLayout";
import { listQuizzesForAdmin } from "@/lib/quiz-file-store";

function formatDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

export default async function QuizDataPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows = await listQuizzesForAdmin();

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Web quiz data</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Source: <code className="text-cyan-500">apps/web/data/section.json</code> and{" "}
          <code className="text-cyan-500">section-wise-question/*.json</code>. Rows are sorted by quiz file modification
          time (newest first). Sections without a quiz file yet appear at the bottom.
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Questions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">File updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-b border-zinc-800/80 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    <Link href={`/quiz-data/${r.slug}`} className="text-cyan-400 hover:underline">
                      {r.label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    <code>{r.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{r.questionCount}</td>
                  <td className="px-4 py-3">
                    {r.hasQuizFile ? (
                      <span className={r.published ? "text-emerald-400" : "text-amber-400"}>
                        {r.published ? "Published" : "Draft"}
                      </span>
                    ) : (
                      <span className="text-zinc-500">No quiz file</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(r.mtimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
