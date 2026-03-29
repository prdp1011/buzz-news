import { MetadataRoute } from "next";
import { prisma } from "database";
import { getBaseUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [quizzes, topicRows] = await Promise.all([
      prisma.quiz.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.quiz.groupBy({
        by: ["topicSlug"],
        where: { published: true },
      }),
    ]);

    const quizUrls: MetadataRoute.Sitemap = quizzes.map((q) => ({
      url: `${baseUrl}/quiz/${q.slug}`,
      lastModified: q.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    const topicUrls: MetadataRoute.Sitemap = topicRows.map((t) => ({
      url: `${baseUrl}/topic/${t.topicSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...topicUrls, ...quizUrls];
  } catch {
    return staticPages;
  }
}
