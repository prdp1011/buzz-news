"use client";

import { PostCard } from "./PostCard";
import { SocialPostCard } from "./SocialPostCard";
import type { FeedItem } from "@/lib/feed";

interface MergedFeedProps {
  items: FeedItem[];
}

export function MergedFeed({ items }: MergedFeedProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      {items.map((item) =>
        item.type === "post" ? (
          <PostCard key={`post-${item.id}`} post={item} />
        ) : (
          <SocialPostCard key={`social-${item.id}`} post={item} />
        )
      )}
    </div>
  );
}
