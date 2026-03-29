import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getJsonQuizDashboardStats } from "@/lib/quiz-file-store";
import { AdminLayout } from "@/components/AdminLayout";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sectionCount, quizFileCount, publishedQuizCount, questionCount } = await getJsonQuizDashboardStats();

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          Welcome back, {session.name ?? session.email}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnalyticsCard title="Sections (section.json)" value={String(sectionCount)} href="/quiz-data" />
          <AnalyticsCard title="Quiz files" value={String(quizFileCount)} href="/quiz-data" />
          <AnalyticsCard title="Published (JSON)" value={String(publishedQuizCount)} href="/quiz-data" />
          <AnalyticsCard title="Questions (all files)" value={String(questionCount)} href="/quiz-data" />
          <AnalyticsCard title="Legacy posts" value="—" href="/posts" />
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Counts come from <code className="text-zinc-400">apps/web/data</code>. Open{" "}
          <strong className="text-zinc-400">Web quizzes (JSON)</strong> to edit questions and use AI to add more.
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
