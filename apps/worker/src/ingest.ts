/**
 * RSS Feed Ingestion Pipeline
 *
 * 1. Fetch RSS feeds from active sources
 * 2. Parse and deduplicate
 * 3. Send to AI processing
 * 4. Save as draft in DB
 */

import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";
import { createHash } from "node:crypto";
import { prisma } from "database";
import {
  rewriteContent,
  generateSEOTitle,
  generateSummary,
  generateTags,
} from "ai-module";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  content?: string;
  "content:encoded"?: string;
  pubDate?: string;
  guid?: string;
}

interface RssChannel {
  item?: RssItem | RssItem[];
  title?: string;
  link?: string;
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

export async function runIngestion() {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
  });

  if (sources.length === 0) {
    console.log("No active sources. Skipping.");
    return;
  }

  let totalProcessed = 0;
  let totalDeduplicated = 0;
  let totalCreated = 0;

  for (const source of sources) {
    try {
      const res = await fetch(source.feedUrl, {
        headers: {
          "User-Agent":
            "GenZNewsBot/1.0 (+https://genznews.com; ingestion)",
        },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch ${source.name}: ${res.status}`);
        continue;
      }

      const xml = await res.text();
      const parsed = parser.parse(xml);
      const channel: RssChannel =
        parsed.rss?.channel ?? parsed.feed ?? parsed;

      const items: RssItem[] = Array.isArray(channel.item)
        ? channel.item
        : channel.item
          ? [channel.item]
          : [];

      for (const item of items) {
        totalProcessed++;

        const rawContent =
          item["content:encoded"] ??
          item.content ??
          item.description ??
          "";
        const title = item.title ?? "Untitled";
        const link = item.link ?? item.guid ?? "";

        if (!rawContent && !title) continue;

        const hash = contentHash(rawContent || title);

        // Deduplicate
        const existing = await prisma.contentHash.findUnique({
          where: { hash },
        });
        if (existing) {
          totalDeduplicated++;
          continue;
        }

        // AI processing
        const [rewrittenContent, seoTitle, summary, tagNames] = await Promise.all(
          [
            rewriteContent(rawContent || title),
            generateSEOTitle(title),
            generateSummary(rawContent || title),
            generateTags(rawContent || title),
          ]
        );

        // Get or create tags
        const tagSlugs = tagNames.map((t) => slugify(t)).filter(Boolean);
        const tags = await Promise.all(
          tagSlugs.slice(0, 5).map(async (slug) => {
            return prisma.tag.upsert({
              where: { slug },
              update: {},
              create: { slug, name: slug.replace(/-/g, " ") },
            });
          })
        );

        // Default category (tech) - in production, use AI to classify
        const defaultCategory = await prisma.category.findFirst({
          where: { slug: "tech" },
        });
        const categoryId = defaultCategory?.id;

        if (!categoryId) {
          console.warn("No default category. Skipping item.");
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
              ? `<p>${rewrittenContent.replace(/\n/g, "</p><p>")}</p>`
              : `<p>${rawContent.slice(0, 5000)}</p>`,
            rawContent: rawContent.slice(0, 10000),
            status: "PENDING_APPROVAL",
            categoryId,
            sourceId: source.id,
            tags: {
              create: tags.map((t) => ({ tagId: t.id })),
            },
          },
        });

        await prisma.contentHash.create({
          data: {
            hash,
            sourceId: source.id,
            postId: post.id,
          },
        });

        totalCreated++;
        console.log(`Created draft: ${post.title} (${post.slug})`);
      }

      await prisma.source.update({
        where: { id: source.id },
        data: { lastFetched: new Date() },
      });
    } catch (err) {
      console.error(`Error processing ${source.name}:`, err);
    }
  }

  console.log(
    `Done. Processed: ${totalProcessed}, Deduplicated: ${totalDeduplicated}, Created: ${totalCreated}`
  );
}
