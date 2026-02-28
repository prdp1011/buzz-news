import { notFound } from "next/navigation";
import { prisma } from "database";
import { getTrendingPostsByCategory } from "@/lib/trending";
import { PostCard } from "@/components/PostCard";
import { CategoryPills } from "@/components/CategoryPills";
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
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
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
      <header className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: category.color ?? "#f59e0b" }}
        >
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-1 text-zinc-500 text-sm">{category.description}</p>
        )}
      </header>

      <CategoryPills categories={categories} activeSlug={slug} />

      <div className="mt-6 flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="py-12 text-center text-zinc-500">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
