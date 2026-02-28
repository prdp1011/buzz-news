import { prisma } from "database";
import { getTrendingPosts } from "@/lib/trending";
import { PostCard } from "@/components/PostCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily dose of news that matters. AI-powered summaries, no paywalls.",
};

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const posts = await getTrendingPosts(12);

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          News That Actually Hits Different
        </h1>
        <p className="text-zinc-400 text-lg">
          No fluff. No bias. Just the stories that matter.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {posts.length === 0 && (
          <p className="text-zinc-500 py-12 text-center">
            No posts yet. Check back soon!
          </p>
        )}
      </section>
    </div>
  );
}
