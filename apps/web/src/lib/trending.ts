import { prisma } from "database";

/**
 * Posts sorted by latest first (publishedAt desc)
 */
const postSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverImage: true,
  publishedAt: true,
  viewCount: true,
  trendingScore: true,
  category: { select: { slug: true, name: true } },
  source: { select: { name: true } },
  tags: { include: { tag: { select: { id: true, slug: true, name: true } } } },
} as const;

export async function getTrendingPosts(limit = 12, offset = 0) {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: postSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getTrendingPostsByCategory(
  categorySlug: string,
  limit = 24,
  offset = 0
) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
    },
    select: postSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
}
