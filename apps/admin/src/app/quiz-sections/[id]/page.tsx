import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";
import { updateQuizSection, deleteQuizSection } from "../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditQuizSectionPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const section = await prisma.quizSection.findUnique({
    where: { id },
    include: { _count: { select: { quizzes: true } } },
  });
  if (!section) notFound();

  return (
    <AdminLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/quiz-sections" className="text-sm text-zinc-500 hover:text-cyan-400">
          ← Sections
        </Link>
        <h1 className="text-2xl font-bold">Edit section</h1>

        <form action={updateQuizSection} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <input type="hidden" name="id" value={section.id} />
          <div>
            <label className="block text-xs font-medium text-zinc-500">Slug</label>
            <input
              name="slug"
              required
              defaultValue={section.slug}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">Label</label>
            <input
              name="label"
              required
              defaultValue={section.label}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500">Cover image URL</label>
            <input
              name="coverImageUrl"
              type="url"
              defaultValue={section.coverImageUrl ?? ""}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-zinc-600">
              Shown on the public section page only — not on individual quiz cards.
            </p>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Save
          </button>
        </form>

        {section._count.quizzes === 0 ? (
          <form action={deleteQuizSection} className="border-t border-zinc-800 pt-6">
            <input type="hidden" name="id" value={section.id} />
            <button
              type="submit"
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete empty section
            </button>
          </form>
        ) : (
          <p className="text-sm text-zinc-500">
            This section has {section._count.quizzes} quiz(es). Remove or move quizzes before
            deleting.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
