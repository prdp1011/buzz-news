import { MetadataRoute } from "next";
import { prisma } from "database";
import { getBaseUrl } from "@/lib/seo";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [posts, categories, tags, socialPosts] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.tag.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.socialPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      select: { id: true, updatedAt: true, publishedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/post/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const tagUrls: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${baseUrl}/tag/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const socialUrls: MetadataRoute.Sitemap = socialPosts.map((s) => ({
    url: `${baseUrl}/social/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postUrls, ...categoryUrls, ...tagUrls, ...socialUrls];
}
