import { getMergedFeed } from "@/lib/feed";
import { getTrendingTags } from "@/lib/tags";
import { MergedFeed } from "@/components/MergedFeed";
import { TrendingTags } from "@/components/TrendingTags";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily dose of news that matters. AI-powered summaries, no paywalls.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [feedItems, tags] = await Promise.all([
    getMergedFeed(24),
    getTrendingTags(12),
  ]);

  return (
    <div>
      {/* Header - mobile-friendly */}
      <section className="mb-4 px-0 pt-0 md:mb-8 md:pt-0">
        <h1 className="mb-1 flex items-center gap-2 text-lg font-bold text-zinc-100 md:mb-2 md:gap-3 md:text-xl">
          Today&apos;s <span className="text-amber-400">☀️</span>
        </h1>
        <p className="text-zinc-500 text-sm md:text-base">
          No fluff. No bias. Just the stories that hit different.
        </p>
      </section>

      {/* Trending tags - hide on mobile to save space */}
      <div className="hidden px-4 md:block md:px-0">
        <TrendingTags tags={tags} />
      </div>

      {/* Feed - posts + social posts merged, sorted by date */}
      <div className="mt-4 md:mx-0 md:mt-6 md:px-4">
        <MergedFeed items={feedItems} />
      </div>
      {feedItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 py-12 text-center text-zinc-500 text-sm md:rounded-2xl md:py-20 md:text-lg">
          No posts yet. Check back soon!
        </div>
      )}
    </div>
  );
}
