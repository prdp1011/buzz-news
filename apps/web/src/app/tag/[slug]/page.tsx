import { notFound } from "next/navigation";
import { prisma } from "database";
import { PostCard } from "@/components/PostCard";
import { CategoryPills } from "@/components/CategoryPills";
import { getBaseUrl, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Tag Not Found" };
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/tag/${slug}`;
  return {
    title: `#${tag.name}`,
    description: `Posts tagged with ${tag.name}`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `#${tag.name} | ${SITE_NAME}`,
      url: canonicalUrl,
      type: "website",
    },
    twitter: { card: "summary", title: `#${tag.name} | ${SITE_NAME}` },
  };
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
      <header className="mb-4 md:mb-8">
        <h1 className="text-lg md:text-2xl font-bold tracking-tight text-zinc-100">
          #{tag.name}
        </h1>
        <p className="mt-1 text-zinc-500 text-sm md:mt-2">
          {posts.length} post{posts.length !== 1 ? "s" : ""} tagged
        </p>
      </header>

      <CategoryPills categories={categories} />

      <div className="mt-4 flex flex-col gap-4 md:mt-8 md:gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="py-16 text-center text-zinc-500 text-lg">
          No posts with this tag yet.
        </p>
      )}
    </div>
  );
}
