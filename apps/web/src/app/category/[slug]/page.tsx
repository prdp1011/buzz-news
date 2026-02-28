import { notFound } from "next/navigation";
import { prisma } from "database";
import { getTrendingPostsByCategory } from "@/lib/trending";
import { PostCard } from "@/components/PostCard";
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

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) notFound();

  const posts = await getTrendingPostsByCategory(slug, 24);

  return (
    <div>
      <header className="mb-12">
        <h1
          className="text-4xl font-bold"
          style={{ color: category.color ?? undefined }}
        >
          {category.name}
        </h1>
        {category.description && (
          <p className="text-zinc-400 text-lg mt-2">{category.description}</p>
        )}
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-zinc-500 py-12 text-center">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
