import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { slugify } from "@/lib/slugify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { category: true, source: true, tags: { include: { tag: true } } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      canonicalUrl,
      categoryId,
      sourceId,
      status,
      tagIds = [],
    } = body;

    if (!title || !slug || !content || !categoryId || !sourceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const finalSlug = slugify(slug);

    const existing = await prisma.post.findFirst({
      where: { slug: finalSlug, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    await prisma.postTag.deleteMany({ where: { postId: id } });

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        summary: summary || null,
        content,
        coverImage: coverImage || null,
        canonicalUrl: canonicalUrl || null,
        categoryId,
        sourceId,
        status: status ?? "DRAFT",
        publishedAt:
          status === "PUBLISHED"
            ? new Date()
            : undefined,
        tags: {
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  try {
    await prisma.contentHash.updateMany({
      where: { postId: id },
      data: { postId: null },
    });
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
