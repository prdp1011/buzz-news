import { getTrendingPosts } from "@/lib/trending";
import { getTrendingTags } from "@/lib/tags";
import { SwipeableFeed } from "@/components/SwipeableFeed";
import { TrendingTags } from "@/components/TrendingTags";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily dose of news that matters. AI-powered summaries, no paywalls.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [posts, tags] = await Promise.all([
    getTrendingPosts(12),
    getTrendingTags(12),
  ]);

  return (
    <div>
      {/* Header - with padding */}
      <section className="mb-4 px-4 pt-4 md:mb-6 md:px-0 md:pt-0">
        <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-zinc-100">
          Today&apos;s <span className="text-amber-400">☀️</span>
        </h1>
        <p className="text-zinc-500 text-sm">
          No fluff. No bias. Just the stories that hit different.
        </p>
      </section>

      {/* Trending tags - hide on mobile to save space */}
      <div className="hidden px-4 md:block md:px-0">
        <TrendingTags tags={tags} />
      </div>

      {/* Feed - full width on mobile for swipe, 470px on desktop */}
      <div className="-mx-0 mt-4 md:mx-0 md:mt-6 md:px-4">
        <SwipeableFeed posts={posts} />
      </div>
      {posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-zinc-500">
          No posts yet. Check back soon!
        </div>
      )}
    </div>
  );
}
