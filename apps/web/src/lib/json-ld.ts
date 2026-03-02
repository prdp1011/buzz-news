import type { Post } from "database";
import { getBaseUrl } from "./seo";

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateJsonLd(
  post: Post & {
    category: { name: string; slug: string };
    source?: { name: string; url: string } | null;
  }
) {
  const baseUrl = getBaseUrl();

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
      name: post.source?.name ?? "Buzz News",
      url: post.source?.url ?? baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Buzz News",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/post/${post.slug}`,
    },
  };
}

export function generateSocialPostJsonLd(
  post: {
    id: string;
    title: string;
    content: string | null;
    imageUrl: string | null;
    publishedAt: Date | null;
    platform: string;
  }
) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/social/${post.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.content?.slice(0, 160) ?? post.title,
    image: post.imageUrl ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: "Buzz News",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Buzz News",
      url: baseUrl,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}
