import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLayout } from "@/components/AdminLayout";
import { readQuizFile, readSectionIndex } from "@/lib/quiz-file-store";
import { CreateQuizFileButton } from "./CreateQuizFileButton";
import { QuizEditorClient } from "./QuizEditorClient";
import { SectionCardEditor } from "./SectionCardEditor";

export default async function QuizDataSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase().replace(/\s+/g, "-");

  const idx = await readSectionIndex();
  const section = idx.sections.find((s) => s.slug === slug);
  if (!section) notFound();

  const quiz = await readQuizFile(slug);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div>
          <Link href="/quiz-data" className="text-sm text-zinc-500 hover:text-cyan-400">
            ← All quizzes
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">{section.label}</h1>
          <p className="mt-1 font-mono text-sm text-cyan-500">{slug}</p>
        </div>

        <SectionCardEditor slug={slug} section={section} />

        {!quiz ? (
          <CreateQuizFileButton slug={slug} />
        ) : (
          <QuizEditorClient initialQuiz={quiz} slug={slug} />
        )}
      </div>
    </AdminLayout>
  );
}
