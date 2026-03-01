import { notFound } from "next/navigation";
import { prisma } from "database";
import { generateJsonLd } from "@/lib/json-ld";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      seoTitle: true,
      summary: true,
      metaDescription: true,
      coverImage: true,
      publishedAt: true,
    },
  });

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle ?? post.title,
    description: post.metaDescription ?? post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 60;

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      source: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const jsonLd = generateJsonLd(post);

  return (
    <article className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-8">
        <a
          href={`/category/${post.category.slug}`}
          className="text-amber-400 text-sm font-medium hover:underline"
        >
          {post.category.name}
        </a>
        <h1 className="text-4xl font-bold mt-2">{post.title}</h1>
        <div className="flex gap-4 mt-4 text-zinc-500 text-sm">
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt?.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.source && (
            <a
              href={post.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300"
            >
              {post.source.name}
            </a>
          )}
        </div>
      </header>

      <img
        src={post.coverImage ?? PLACEHOLDER_IMAGE}
        alt=""
        className="w-full rounded-lg mb-8 aspect-video object-cover"
      />

      {post.summary && (
        <p className="text-xl text-zinc-400 mb-8">{post.summary}</p>
      )}

      <div
        className="article-content prose prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <a
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm hover:bg-amber-500/20 hover:text-amber-400"
            >
              {tag.name}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
