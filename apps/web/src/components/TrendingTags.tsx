import Link from "next/link";

interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface TrendingTagsProps {
  tags: Tag[];
}

export function TrendingTags({ tags }: TrendingTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-3 scrollbar-hide">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Trending
      </span>
      <div className="flex gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="shrink-0 rounded-full bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-cyan-400"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
