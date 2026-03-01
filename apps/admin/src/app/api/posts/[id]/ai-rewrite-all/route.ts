import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { slugify } from "@/lib/slugify";
import { processContent, textToBulletHtml } from "ai-module";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const hasOpenAiKey = !!process.env.OPENAI_API_KEY;
  const rawText =
    post.rawContent ||
    post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (!rawText || rawText.length < 10) {
    return NextResponse.json(
      {
        error:
          "Post has no content to rewrite. Add content or use Fetch Full Story first.",
      },
      { status: 400 }
    );
  }

  try {
    const { seoTitle, rewrittenContent, summary } =
      await processContent(rawText);

    if (!rewrittenContent || rewrittenContent.length < 10) {
      return NextResponse.json(
        { error: "AI returned empty content. Try again or check OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const content = textToBulletHtml(rewrittenContent) || `<p>${rewrittenContent.replace(/\n/g, "</p><p>")}</p>`;
    const baseSlug = slugify(seoTitle || post.title);
    let slug = baseSlug;
    let suffix = 0;
    while (
      await prisma.post.findFirst({
        where: { slug, NOT: { id } },
      })
    ) {
      slug = `${baseSlug}-${++suffix}`;
    }

    await prisma.post.update({
      where: { id },
      data: {
        title: seoTitle || post.title,
        slug,
        content,
        summary: summary || post.summary,
      },
    });

    return NextResponse.json({
      title: seoTitle || post.title,
      slug,
      content,
      summary: summary || post.summary,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[ai-rewrite-all] Error:", err.message, err);
    return NextResponse.json(
      {
        error: err.message || "AI rewrite failed",
        hint: !hasOpenAiKey
          ? "Set OPENAI_API_KEY in .env (root or apps/admin)"
          : undefined,
      },
      { status: 500 }
    );
  }
}
