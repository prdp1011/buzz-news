import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    category: { slug: string; name: string };
    tags: { tag: { slug: string; name: string } }[];
    viewCount?: number;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-cyan-500/50 hover:bg-zinc-900"
    >
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt=""
          className="mb-4 w-full rounded-lg aspect-video object-cover"
        />
      )}
      <span className="text-cyan-400 text-sm font-medium">
        {post.category.name}
      </span>
      <h3 className="mt-2 text-xl font-semibold group-hover:text-cyan-400 transition">
        {post.title}
      </h3>
      {post.summary && (
        <p className="mt-2 text-zinc-400 line-clamp-2">{post.summary}</p>
      )}
      <div className="mt-4 flex items-center gap-4 text-zinc-500 text-sm">
        <time dateTime={post.publishedAt?.toISOString()}>
          {post.publishedAt?.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
        {post.viewCount !== undefined && post.viewCount > 0 && (
          <span>{post.viewCount} views</span>
        )}
      </div>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
