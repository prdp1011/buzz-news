import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "database";
import { rewriteContent } from "ai-module";

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
  console.log("[ai-rewrite] Start", {
    postId: id,
    hasOpenAiKey,
    contentLen: post.content?.length ?? 0,
    rawContentLen: post.rawContent?.length ?? 0,
  });

  const rawText =
    post.rawContent ||
    post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (!rawText || rawText.length < 10) {
    console.warn("[ai-rewrite] Empty or too short input", { rawTextLen: rawText.length });
    return NextResponse.json(
      { error: "Post has no content to rewrite. Add content or use Fetch Full Story first." },
      { status: 400 }
    );
  }

  try {
    console.log("[ai-rewrite] Calling rewriteContent", { inputLen: rawText.length });
    const rewritten = await rewriteContent(rawText);
    console.log("[ai-rewrite] Rewrite done", { outputLen: rewritten?.length ?? 0 });

    if (!rewritten || rewritten.length < 10) {
      console.warn("[ai-rewrite] Empty rewrite result");
      return NextResponse.json(
        { error: "AI returned empty content. Try again or check OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const content = `<p>${rewritten.replace(/\n/g, "</p><p>")}</p>`;

    await prisma.post.update({
      where: { id },
      data: { content },
    });

    console.log("[ai-rewrite] Success", { contentLen: content.length });
    return NextResponse.json({ content });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[ai-rewrite] Error:", err.message, err);
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
