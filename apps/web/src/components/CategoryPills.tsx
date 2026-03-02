"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  slug: string;
  name: string;
  color?: string | null;
}

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string | null;
}

export function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
  const pathname = usePathname();
  const pathSlug = pathname?.startsWith("/category/")
    ? pathname.split("/")[2]
    : null;
  const currentSlug = activeSlug ?? pathSlug;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:gap-3 md:pb-3">
      <Link
        href="/"
        className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition min-h-[36px] flex items-center md:min-h-0 md:px-4 md:py-2 ${
          !currentSlug
            ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40"
            : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition min-h-[36px] flex items-center md:min-h-0 md:px-4 md:py-2 ${
            currentSlug === cat.slug
              ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40"
              : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          }`}
          style={
            currentSlug === cat.slug && cat.color
              ? { backgroundColor: `${cat.color}20`, color: cat.color }
              : undefined
          }
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
