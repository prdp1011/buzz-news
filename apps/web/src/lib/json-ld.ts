import type { Post } from "database";

export function generateJsonLd(
  post: Post & {
    category: { name: string };
    source?: { name: string; url: string } | null;
  }
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://genznews.com";

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary ?? post.metaDescription ?? undefined,
    image: post.coverImage ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: post.source?.name ?? "Gen Z News",
      url: post.source?.url ?? baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Gen Z News",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/post/${post.slug}`,
    },
  };
}
