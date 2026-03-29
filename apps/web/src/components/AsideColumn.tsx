import Link from "next/link";
import { listSidebarQuizzes } from "@/lib/quiz";
import { AdSlot } from "@/components/ads/GoogleAdSense";

export async function AsideColumn() {
  const quizzes = await listSidebarQuizzes();

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="sticky top-20 space-y-6">
        <AdSlot placement="rail-right" />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            More quizzes
          </p>
          <div className="space-y-2">
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
      </div>
    </aside>
  );
}
