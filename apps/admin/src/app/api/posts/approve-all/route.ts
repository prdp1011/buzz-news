import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "database";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.post.updateMany({
      where: { status: "PENDING_APPROVAL" },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Approve all error:", error);
    return NextResponse.json(
      { error: "Failed to approve posts" },
      { status: 500 }
    );
  }
}
