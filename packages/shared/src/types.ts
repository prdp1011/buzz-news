export type PostStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  category: { slug: string; name: string };
  tags: { tag: { slug: string; name: string } }[];
  viewCount: number;
  trendingScore: number;
}

export interface PostDetail extends PostListItem {
  content: string;
  seoTitle: string | null;
  metaDescription: string | null;
  source?: { name: string; url: string };
}
