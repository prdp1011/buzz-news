import Link from "next/link";
import type { SectionNavItem } from "@/lib/quiz";

export function SectionCard({ section }: { section: SectionNavItem }) {
  const emoji = section.emoji ?? "📂";
  return (
    <Link
      href={`/quiz/${section.slug}`}
      className="group block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-amber-500/40 hover:bg-zinc-900/80 md:p-7"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl" aria-hidden>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-zinc-100 group-hover:text-amber-400 md:text-xl">
            {section.label}
          </h2>
          {section.description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500">
              {section.description}
            </p>
          ) : null}
          <p className="mt-4 text-xs font-medium text-amber-500/90">Start quiz →</p>
        </div>
      </div>
    </Link>
  );
}
