import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "database";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { getMergedFeed } from "@/lib/feed";
import { MergedFeed } from "@/components/MergedFeed";

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.socialPost.findUnique({
    where: { id, status: "PUBLISHED" },
  });
  if (!post) return { title: "Post Not Found" };
  return { title: `${post.title} | Buzz News` };
}

export const revalidate = 60;

export default async function SocialPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, feedItems] = await Promise.all([
    prisma.socialPost.findUnique({
      where: { id, status: "PUBLISHED" },
    }),
    getMergedFeed(24),
  ]);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 md:px-0">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400"
      >
        ← Back to Home
      </Link>

      <header className="mb-6 md:mb-10">
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-400">
          {PLATFORM_LABELS[post.platform]}
        </span>
        <h1 className="mt-3 text-xl font-bold leading-tight tracking-tight md:text-3xl">
          {post.title}
        </h1>
        {post.publishedAt && (
          <time
            dateTime={post.publishedAt.toISOString()}
            className="mt-2 block text-sm text-zinc-500"
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </header>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="mb-6 w-full rounded-xl aspect-video object-cover md:mb-10 md:rounded-2xl"
        />
      )}

      {post.videoUrl && (
        <div className="mb-6 md:mb-10">
          <a
            href={post.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-zinc-800 md:rounded-2xl"
          >
            <div className="relative aspect-video bg-zinc-800">
              <img
                src={post.imageUrl ?? PLACEHOLDER_IMAGE}
                alt=""
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-black/60 p-4 text-4xl">▶️</span>
              </div>
            </div>
            <p className="p-4 text-center text-sm text-amber-400">
              Watch on YouTube →
            </p>
          </a>
        </div>
      )}

      {post.content && (
        <div className="prose prose-invert prose-sm max-w-none prose-p:text-base prose-p:leading-relaxed">
          <p className="text-zinc-400">{post.content}</p>
        </div>
      )}

      {post.externalUrl && (
        <a
          href={post.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-6 py-3 font-semibold text-amber-400 hover:bg-amber-500/30"
        >
          View on {PLATFORM_LABELS[post.platform]}
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      )}

      {/* Same merged feed as home page (exclude current post) */}
      <div className="mt-12 pt-8 border-t border-zinc-800">
        <h2 className="mb-4 text-lg font-bold text-zinc-200">More stories</h2>
        <MergedFeed items={feedItems.filter((i) => !(i.type === "social" && i.id === post.id))} />
      </div>
    </article>
  );
}
