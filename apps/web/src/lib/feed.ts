import { prisma } from "database";

/**
 * Unified feed item - either a Post or SocialPost
 */
export type FeedItem =
  | {
      type: "post";
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
  | {
      type: "social";
      id: string;
      slug: string; // social-{id} for routing
      title: string;
      summary: string | null;
      coverImage: string | null;
      publishedAt: Date | null;
      platform: "INSTAGRAM" | "FACEBOOK" | "YOUTUBE";
      externalUrl: string | null;
      videoUrl: string | null;
    };

const postSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverImage: true,
  publishedAt: true,
  viewCount: true,
  category: { select: { slug: true, name: true } },
  source: { select: { name: true } },
  tags: { include: { tag: { select: { id: true, slug: true, name: true } } } },
} as const;

export async function getMergedFeed(limit = 24, offset = 0): Promise<FeedItem[]> {
  const [posts, socialPosts] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: postSelect,
      orderBy: { publishedAt: "desc" },
      take: limit + 50, // Fetch extra to merge
      skip: 0,
    }),
    prisma.socialPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: limit + 50,
      skip: 0,
    }),
  ]);

  const postItems: FeedItem[] = posts.map((p) => ({
    type: "post",
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    coverImage: p.coverImage,
    publishedAt: p.publishedAt,
    category: p.category,
    source: p.source,
    tags: p.tags,
    viewCount: p.viewCount,
  }));

  const socialItems: FeedItem[] = socialPosts.map((s) => ({
    type: "social",
    id: s.id,
    slug: `social-${s.id}`,
    title: s.title,
    summary: s.content,
    coverImage: s.imageUrl,
    publishedAt: s.publishedAt,
    platform: s.platform,
    externalUrl: s.externalUrl,
    videoUrl: s.videoUrl,
  }));

  const merged = [...postItems, ...socialItems].sort((a, b) => {
    const aDate = a.publishedAt?.getTime() ?? 0;
    const bDate = b.publishedAt?.getTime() ?? 0;
    return bDate - aDate; // newest first
  });

  return merged.slice(offset, offset + limit);
}
