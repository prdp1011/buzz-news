import { notFound } from "next/navigation";
import { prisma } from "database";
import { getTrendingPostsByCategory } from "@/lib/trending";
import { PostCard } from "@/components/PostCard";
import { CategoryPills } from "@/components/CategoryPills";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  if (!category) return { title: "Category Not Found" };
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/category/${slug}`;
  const description =
    category.description ?? `Latest ${category.name} news and stories`;
  return {
    title: category.name,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: { card: "summary", title: `${category.name} | ${SITE_NAME}` },
  };
}

// Return [] to avoid DB connection pool exhaustion during Vercel build.
// Pages are generated on-demand with ISR (revalidate: 60).
export async function generateStaticParams() {
  return [];
}

export const revalidate = 60;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const [category, posts, categories] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    getTrendingPostsByCategory(slug, 24),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, color: true },
    }),
  ]);

  if (!category) notFound();

  return (
    <div>
      <header className="mb-4 md:mb-8">
        <h1
          className="text-lg md:text-2xl font-bold tracking-tight"
          style={{ color: category.color ?? "#f59e0b" }}
        >
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-1 text-zinc-500 text-sm md:mt-2 md:text-base">{category.description}</p>
        )}
      </header>

      <CategoryPills categories={categories} activeSlug={slug} />

      <div className="mt-4 flex flex-col gap-4 md:mt-6 md:gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="py-16 text-center text-zinc-500 text-lg">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
