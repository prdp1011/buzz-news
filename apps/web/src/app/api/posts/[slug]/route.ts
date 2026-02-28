import { NextRequest, NextResponse } from "next/server";
import { prisma } from "database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        category: true,
        source: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("API /posts/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
