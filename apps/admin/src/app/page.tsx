import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { AdminLayout } from "@/components/AdminLayout";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [sectionCount, quizCount, publishedQuiz, questionCount] = await Promise.all([
    prisma.quizSection.count(),
    prisma.quiz.count(),
    prisma.quiz.count({ where: { published: true } }),
    prisma.quizQuestion.count(),
  ]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          Welcome back, {session.name ?? session.email}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnalyticsCard title="Sections" value={String(sectionCount)} href="/quiz-sections" />
          <AnalyticsCard title="Quizzes" value={String(quizCount)} href="/quiz-items" />
          <AnalyticsCard title="Published quizzes" value={String(publishedQuiz)} href="/quiz-items" />
          <AnalyticsCard title="Questions" value={String(questionCount)} href="/quiz-questions" />
          <AnalyticsCard title="Legacy posts" value="—" href="/posts" />
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Use <strong className="text-zinc-400">Sections</strong> for cover images and grouping.{" "}
          <strong className="text-zinc-400">Quizzes</strong> stay text/emoji-only on the public site.
        </p>
      </div>
    </AdminLayout>
  );
}

function AnalyticsCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-zinc-600"
    >
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Link>
  );
}
