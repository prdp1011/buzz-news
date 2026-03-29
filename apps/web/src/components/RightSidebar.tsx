import Link from "next/link";
import { prisma } from "database";

export async function RightSidebar() {
  const quizzes = await prisma.quiz.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: { slug: true, title: true, emoji: true },
  });

  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="mb-4 text-sm font-bold text-zinc-300">Play next</p>
          <div className="space-y-3">
            {quizzes.map((q) => (
              <Link
                key={q.slug}
                href={`/quiz/${q.slug}`}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
              >
                <span>{q.emoji ?? "❓"}</span>
                <span className="line-clamp-2">{q.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-2 text-sm text-zinc-500">
          <Link href="/privacy" className="block hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="block hover:underline">
            Terms
          </Link>
          <Link href="/about" className="block hover:underline">
            About
          </Link>
        </div>
      </div>
    </aside>
  );
}
