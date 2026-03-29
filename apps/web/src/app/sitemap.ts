import { MetadataRoute } from "next";
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
    const res = await fetch(`${baseUrl}/api/quiz/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticPages;

    const data = (await res.json()) as {
      quizzes: { slug: string; updatedAt: string }[];
      sections: { slug: string; updatedAt: string }[];
    };

    const quizUrls: MetadataRoute.Sitemap = data.quizzes.map((q) => ({
      url: `${baseUrl}/quiz/${q.slug}/1`,
      lastModified: new Date(q.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    const sectionUrls: MetadataRoute.Sitemap = data.sections.map((s) => ({
      url: `${baseUrl}/section/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...sectionUrls, ...quizUrls];
  } catch {
    return staticPages;
  }
}
