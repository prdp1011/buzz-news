"use client";

import { PostCard } from "./PostCard";

interface Post {
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
}

interface SwipeableFeedProps {
  posts: Post[];
}

export function SwipeableFeed({ posts }: SwipeableFeedProps) {
  if (posts.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
