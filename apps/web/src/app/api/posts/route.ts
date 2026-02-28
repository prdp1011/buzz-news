import { NextRequest, NextResponse } from "next/server";
import { prisma } from "database";
import { getTrendingPosts, getTrendingPostsByCategory } from "@/lib/trending";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "20", 10),
      50
    );
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    let posts;
    if (category) {
      posts = await getTrendingPostsByCategory(category, limit, offset);
    } else {
      posts = await getTrendingPosts(limit, offset);
    }

    return NextResponse.json({
      posts,
      meta: { limit, offset, category: category ?? null },
    });
  } catch (error) {
    console.error("API /posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
