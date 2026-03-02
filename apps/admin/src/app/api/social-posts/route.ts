import { NextResponse } from "next/server";
import { prisma } from "database";

export async function GET() {
  const posts = await prisma.socialPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, title, content, imageUrl, videoUrl, publishedAt, status, externalUrl } = body;

    if (!platform || !title) {
      return NextResponse.json(
        { error: "Platform and title are required" },
        { status: 400 }
      );
    }

    const validPlatforms = ["INSTAGRAM", "FACEBOOK", "YOUTUBE"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Use INSTAGRAM, FACEBOOK, or YOUTUBE" },
        { status: 400 }
      );
    }

    const post = await prisma.socialPost.create({
      data: {
        platform,
        title,
        content: content || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        status: status || "DRAFT",
        externalUrl: externalUrl || null,
      },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error("Create social post error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create" },
      { status: 500 }
    );
  }
}
