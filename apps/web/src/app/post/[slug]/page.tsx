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

// Return [] to avoid DB connection pool exhaustion during Vercel build.
// Pages are generated on-demand with ISR (revalidate: 60).
export async function generateStaticParams() {
  return [];
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
    <article className="max-w-3xl mx-auto md:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-6 md:mb-10">
        <a
          href={`/category/${post.category.slug}`}
          className="text-amber-400 text-sm font-semibold hover:underline"
        >
          {post.category.name}
        </a>
        <h1 className="text-xl md:text-3xl font-bold mt-2 md:mt-3 leading-tight tracking-tight">{post.title}</h1>
        <div className="flex flex-wrap gap-3 mt-3 text-zinc-500 text-sm md:gap-5 md:mt-5">
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
        className="w-full rounded-xl md:rounded-2xl mb-6 md:mb-10 aspect-video object-cover"
      />

      {post.summary && (
        <div className="mb-6 md:mb-10 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">AI Summarize</span>
          </div>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed">{post.summary}</p>
        </div>
      )}

      <div
        className="article-content prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-base prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <div className="mt-6 md:mt-10 flex flex-wrap gap-2 md:gap-3">
          {post.tags.map(({ tag }) => (
            <a
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-amber-500/20 hover:text-amber-400 min-h-[36px] flex items-center"
            >
              {tag.name}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
