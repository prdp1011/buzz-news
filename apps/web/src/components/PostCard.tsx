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
    source?: { name: string } | null;
    tags: { tag: { id: string; slug: string; name: string } }[];
    viewCount?: number;
  };
  variant?: "default" | "mobile";
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const timeAgo = post.publishedAt
    ? formatTimeAgo(post.publishedAt)
    : "Just now";

  const isMobile = variant === "mobile";

  return (
    <article
      className={`overflow-hidden border border-zinc-800 bg-zinc-900/50 ${
        isMobile ? "h-full w-full rounded-none" : "rounded-xl"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
            {post.source ? getInitials(post.source.name) : post.category.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-200">
              {post.source?.name ?? post.category.name}
            </span>
            <span className="text-xs text-zinc-500">{timeAgo}</span>
          </div>
        </div>
        <button
          type="button"
          className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          aria-label="More options"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Category tag */}
      <div className="px-4 pb-2">
        <Link
          href={`/category/${post.category.slug}`}
          className="inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-amber-400"
        >
          {post.category.name}
        </Link>
      </div>

      {/* Title & description */}
      <div className="px-4 pb-3">
        <Link href={`/post/${post.slug}`}>
          <h3 className="font-semibold text-zinc-100 hover:text-amber-400 transition line-clamp-2">
            {post.title}
          </h3>
        </Link>
        {post.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
            {post.summary}
          </p>
        )}
      </div>

      {/* Main image - 16:9 aspect ratio */}
      <Link href={`/post/${post.slug}`} className="block">
        {post.coverImage ? (
          <div className="aspect-video overflow-hidden bg-zinc-800">
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-zinc-800/50" />
        )}
      </Link>

      {/* Engagement bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-500 text-sm">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.viewCount ?? 0}
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500 text-sm">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {Math.floor((post.viewCount ?? 0) * 0.1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" aria-label="Share">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button type="button" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" aria-label="Save">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* View Post button */}
      <div className="px-4 pb-4">
        <Link
          href={`/post/${post.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500/20 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/30"
        >
          View Post
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
