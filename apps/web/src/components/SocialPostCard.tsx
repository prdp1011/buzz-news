import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

const PLATFORM_ICONS: Record<string, string> = {
  INSTAGRAM: "📷",
  FACEBOOK: "👍",
  YOUTUBE: "▶️",
};

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
};

interface SocialPostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    platform: "INSTAGRAM" | "FACEBOOK" | "YOUTUBE";
    externalUrl: string | null;
    videoUrl: string | null;
  };
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

export function SocialPostCard({ post }: SocialPostCardProps) {
  const timeAgo = post.publishedAt
    ? formatTimeAgo(post.publishedAt)
    : "Just now";
  const href = post.externalUrl ?? `/social/${post.id}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between gap-2 px-4 py-3 md:gap-3 md:px-5 md:py-4">
        <div className="flex items-center gap-2 min-w-0 md:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-base">
            {PLATFORM_ICONS[post.platform] ?? "📱"}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-200">
              {PLATFORM_LABELS[post.platform]}
            </span>
            <span className="text-xs text-zinc-500">{timeAgo}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-400">
          {PLATFORM_LABELS[post.platform]}
        </span>
      </div>

      <div className="px-4 pb-3 md:px-5 md:pb-4">
        <Link href={href} target={post.externalUrl ? "_blank" : undefined} rel={post.externalUrl ? "noopener noreferrer" : undefined}>
          <h3 className="text-base font-bold leading-snug text-zinc-100 hover:text-amber-400 transition line-clamp-2">
            {post.title}
          </h3>
        </Link>
        {post.summary && (
          <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500 leading-relaxed md:mt-2">
            {post.summary}
          </p>
        )}
      </div>

      <Link href={href} target={post.externalUrl ? "_blank" : undefined} rel={post.externalUrl ? "noopener noreferrer" : undefined} className="block">
        <div className="aspect-video overflow-hidden bg-zinc-800">
          {post.videoUrl ? (
            <div className="relative flex h-full w-full items-center justify-center bg-zinc-800">
              <span className="text-4xl">▶️</span>
              <img
                src={post.coverImage ?? PLACEHOLDER_IMAGE}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />
            </div>
          ) : (
            <img
              src={post.coverImage ?? PLACEHOLDER_IMAGE}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </Link>

      <div className="px-4 py-4 md:px-5 md:pb-5">
        <Link
          href={href}
          target={post.externalUrl ? "_blank" : undefined}
          rel={post.externalUrl ? "noopener noreferrer" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/20 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/30 min-h-[44px]"
        >
          View on {PLATFORM_LABELS[post.platform]}
          <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
