/**
 * Content ingestion - fetches from RSS feeds, processes with AI, saves as drafts.
 * Shared logic for admin "Fetch Fresh Stories" and worker cron.
 */

import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { prisma } from "database";
import {
  rewriteContent,
  generateSEOTitle,
  generateSummary,
  generateTags,
  textToBulletHtml,
} from "ai-module";
import type { SourceType } from "database";

interface IngestionItem {
  title: string;
  content: string;
  link?: string;
  publishedAt?: Date;
  guid?: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  const headers = {
    "User-Agent": "BuzzNewsBot/1.0 (+https://buzznews.com; ingestion)",
  };
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok || attempt === retries) return res;
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      } else {
        throw lastError;
      }
    }
  }
  throw lastError ?? new Error("Fetch failed");
}

async function fetchRssItems(url: string): Promise<IngestionItem[]> {
  const res = await fetchWithRetry(url);
  if (!res.ok) return [];
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed = parser.parse(xml);
  const channel = parsed.rss?.channel ?? parsed.feed ?? parsed;
  const rawItems = channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
  return items.map((item: Record<string, unknown>) => ({
    title: String(item.title ?? "Untitled"),
    content:
      String(
        item["content:encoded"] ?? item.content ?? item.description ?? ""
      ).trim() || String(item.title ?? ""),
    link: item.link ? String(item.link) : item.guid ? String(item.guid) : undefined,
    publishedAt: item.pubDate ? new Date(String(item.pubDate)) : undefined,
    guid: item.guid ? String(item.guid) : undefined,
  }));
}

async function fetchItems(
  source: { type: SourceType; feedUrl: string; config?: string | null }
): Promise<IngestionItem[]> {
  if (source.type === "RSS") {
    return fetchRssItems(source.feedUrl);
  }
  // SCRAPER and SOCIAL not implemented in admin - worker handles those
  return [];
}

function normalizeContent(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function contentHash(text: string): string {
  return createHash("sha256").update(normalizeContent(text)).digest("hex");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface IngestResult {
  processed: number;
  deduplicated: number;
  created: number;
  errors: string[];
}

export async function runIngestion(
  sourceIds?: string[]
): Promise<IngestResult> {
  const where = sourceIds?.length
    ? { id: { in: sourceIds }, isActive: true }
    : { isActive: true };

  const sources = await prisma.source.findMany({
    where,
  });

  const result: IngestResult = {
    processed: 0,
    deduplicated: 0,
    created: 0,
    errors: [],
  };

  for (const source of sources) {
    try {
      if (source.type !== "RSS") {
        result.errors.push(`${source.name}: Only RSS sources supported from admin`);
        continue;
      }

      const items = await fetchItems(source);
      result.processed += items.length;

      for (const item of items) {
        const rawContent = item.content || item.title;
        const title = item.title || "Untitled";

        if (!rawContent && !title) continue;

        const hash = contentHash(rawContent);
        const existing = await prisma.contentHash.findUnique({
          where: { hash },
        });
        if (existing) {
          result.deduplicated++;
          continue;
        }

        const [rewrittenContent, seoTitle, summary, tagNames] = await Promise.all([
          rewriteContent(rawContent),
          generateSEOTitle(title),
          generateSummary(rawContent),
          generateTags(rawContent),
        ]);

        const tagSlugs = tagNames.map((t) => slugify(t)).filter(Boolean);
        const tags = await Promise.all(
          tagSlugs.slice(0, 5).map((slug) =>
            prisma.tag.upsert({
              where: { slug },
              update: {},
              create: { slug, name: slug.replace(/-/g, " ") },
            })
          )
        );

        const defaultCategory = await prisma.category.findFirst({
          where: { slug: "tech" },
        });
        if (!defaultCategory) {
          result.errors.push(`No default category. Skipped: ${title}`);
          continue;
        }

        const baseSlug = slugify(title);
        let slug = baseSlug;
        let suffix = 0;
        while (await prisma.post.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${++suffix}`;
        }

        const post = await prisma.post.create({
          data: {
            slug,
            title,
            seoTitle,
            summary,
            content: rewrittenContent
              ? textToBulletHtml(rewrittenContent) ||
                `<p>${rewrittenContent.replace(/\n/g, "</p><p>")}</p>`
              : `<p>${rawContent.slice(0, 5000)}</p>`,
            rawContent: rawContent.slice(0, 10000),
            canonicalUrl: item.link || null,
            status: "PENDING_APPROVAL",
            categoryId: defaultCategory.id,
            sourceId: source.id,
            tags: {
              create: tags.map((t) => ({ tagId: t.id })),
            },
          },
        });

        await prisma.contentHash.create({
          data: { hash, sourceId: source.id, postId: post.id },
        });

        result.created++;
      }

      await prisma.source.update({
        where: { id: source.id },
        data: { lastFetched: new Date() },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`${source.name}: ${msg}`);
    }
  }

  return result;
}
