import { notFound } from "next/navigation";
import { prisma } from "database";
import { PostCard } from "@/components/PostCard";
import { CategoryPills } from "@/components/CategoryPills";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Tag Not Found" };
  return { title: `${tag.name} | Gen Z News` };
}

export const revalidate = 60;

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { tagId: tag.id } },
    },
    orderBy: { publishedAt: "desc" },
    include: {
      category: true,
      source: true,
      tags: { include: { tag: true } },
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true, color: true },
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">
          #{tag.name}
        </h1>
        <p className="mt-2 text-zinc-500 text-sm">
          {posts.length} post{posts.length !== 1 ? "s" : ""} tagged
        </p>
      </header>

      <CategoryPills categories={categories} />

      <div className="mt-8 flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="py-12 text-center text-zinc-500">
          No posts with this tag yet.
        </p>
      )}
    </div>
  );
}
