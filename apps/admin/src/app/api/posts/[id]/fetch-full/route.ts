import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "database";

const ARTICLE_PATTERNS = [
  /<article[^>]*>([\s\S]*?)<\/article>/gi,
  /<main[^>]*>([\s\S]*?)<\/main>/gi,
  /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
];

function stripHtml(html: string, maxLen = 50000): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function extractArticleContent(html: string): string {
  for (const re of ARTICLE_PATTERNS) {
    const m = re.exec(html);
    if (m?.[1]) return stripHtml(m[1]);
  }
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return stripHtml(bodyMatch?.[1] ?? html);
}

export async function POST(
  request: NextRequest,
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

  let url: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    url = body.url || post.canonicalUrl || null;
  } catch {
    url = post.canonicalUrl;
  }

  if (!url) {
    return NextResponse.json(
      { error: "No article URL. Set canonical URL or pass url in body." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GenZNewsAdmin/1.0; +https://genznews.com)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const content = extractArticleContent(html);

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: "Could not extract meaningful content from URL" },
        { status: 422 }
      );
    }

    const formattedContent = content
      .split(/\s{2,}/)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("\n");

    await prisma.post.update({
      where: { id },
      data: {
        content: formattedContent,
        rawContent: content.slice(0, 10000),
        canonicalUrl: url,
      },
    });

    return NextResponse.json({
      content: formattedContent,
      canonicalUrl: url,
    });
  } catch (error) {
    console.error("Fetch full error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
