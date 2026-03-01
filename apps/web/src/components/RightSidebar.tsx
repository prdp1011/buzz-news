import Link from "next/link";
import { prisma } from "database";

export async function RightSidebar() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 5,
      select: { slug: true, name: true },
    }),
    prisma.tag.findMany({ take: 5, orderBy: { name: "asc" } }),
  ]);

  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">
            Suggested for you
          </p>
          <div className="space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center justify-between text-sm text-zinc-400 hover:text-amber-400"
              >
                <span>{cat.name}</span>
                <span className="text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-3 text-sm font-semibold text-zinc-300">
              Trending tags
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-amber-400"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2 text-xs text-zinc-500">
          <Link href="/category/tech" className="block hover:underline">
            Tech
          </Link>
          <Link href="/category/culture" className="block hover:underline">
            Culture
          </Link>
          <Link href="/category/lifestyle" className="block hover:underline">
            Lifestyle
          </Link>
          <Link href="/category/news" className="block hover:underline">
            News
          </Link>
          <p className="pt-4">
            © {new Date().getFullYear()} Buzz News
          </p>
        </div>
      </div>
    </aside>
  );
}
