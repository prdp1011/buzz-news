import { prisma } from "database";

/**
 * Trending algorithm placeholder
 *
 * Current formula: weighted combination of:
 * - viewCount (normalized)
 * - trendingScore (manual/ML score 0-1)
 * - recency (exponential decay)
 *
 * TODO: Replace with ML-based engagement prediction
 */
const TRENDING_WEIGHTS = {
  views: 0.3,
  score: 0.4,
  recency: 0.3,
};

function computeTrendingScore(post: {
  viewCount: number;
  trendingScore: number;
  publishedAt: Date | null;
}) {
  const maxViews = 10000; // Normalize to reasonable max
  const viewNorm = Math.min(post.viewCount / maxViews, 1);
  const scoreNorm = post.trendingScore;
  const now = Date.now();
  const published = post.publishedAt?.getTime() ?? now;
  const hoursSince = (now - published) / (1000 * 60 * 60);
  const recencyNorm = Math.exp(-hoursSince / 72); // Half-life ~3 days

  return (
    TRENDING_WEIGHTS.views * viewNorm +
    TRENDING_WEIGHTS.score * scoreNorm +
    TRENDING_WEIGHTS.recency * recencyNorm
  );
}

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
  tags: { include: { tag: { select: { slug: true, name: true } } } },
} as const;

export async function getTrendingPosts(limit = 12, offset = 0) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: postSelect,
    orderBy: { publishedAt: "desc" },
    take: limit * 2, // Fetch extra for sorting
    skip: 0,
  });

  const scored = posts
    .map((p) => ({
      ...p,
      _computedScore: computeTrendingScore(p),
    }))
    .sort((a, b) => b._computedScore - a._computedScore)
    .slice(offset, offset + limit)
    .map(({ _computedScore, ...rest }) => rest);

  return scored;
}

export async function getTrendingPostsByCategory(
  categorySlug: string,
  limit = 24,
  offset = 0
) {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
    },
    select: postSelect,
    orderBy: { publishedAt: "desc" },
    take: limit * 2,
    skip: 0,
  });

  const scored = posts
    .map((p) => ({
      ...p,
      _computedScore: computeTrendingScore(p),
    }))
    .sort((a, b) => b._computedScore - a._computedScore)
    .slice(offset, offset + limit)
    .map(({ _computedScore, ...rest }) => rest);

  return scored;
}
