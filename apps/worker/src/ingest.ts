/**
 * Content Ingestion Pipeline
 *
 * 1. Fetch from sources (RSS, Scraper, Social)
 * 2. Parse and deduplicate
 * 3. AI processing (rewrite, SEO, summary, tags)
 * 4. Save as draft in DB
 */

import { createHash } from "node:crypto";
import { prisma } from "database";
import {
  rewriteContent,
  generateSEOTitle,
  generateSummary,
  generateTags,
} from "ai-module";
import { getAdapter } from "./adapters/index.js";
import { logger } from "./lib/logger.js";

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
  logger.info("Step: Loading active sources");
  const sources = await prisma.source.findMany({
    where: { isActive: true },
  });

  if (sources.length === 0) {
    logger.info("No active sources. Skipping.");
    return;
  }
  logger.info("Step: Sources loaded", { count: sources.length, names: sources.map((s) => s.name) });

  let totalProcessed = 0;
  let totalDeduplicated = 0;
  let totalCreated = 0;

  for (const source of sources) {
    try {
      logger.info("Step: Processing source", { source: source.name, type: source.type });
      const adapter = getAdapter(source.type);
      logger.info("Step: Fetching items", { source: source.name, url: source.feedUrl });
      const items = await adapter.fetchItems(
        source.feedUrl,
        source.config ?? undefined
      );
      logger.info("Step: Items fetched", { source: source.name, count: items.length });

      for (const item of items) {
        totalProcessed++;

        const rawContent = item.content || item.title;
        const title = item.title || "Untitled";

        if (!rawContent && !title) {
          logger.debug("Step: Skipping item (no content)", { title: item.title });
          continue;
        }

        const hash = contentHash(rawContent);
        logger.debug("Step: Checking deduplication", { hash: hash.slice(0, 12) });

        const existing = await prisma.contentHash.findUnique({
          where: { hash },
        });
        if (existing) {
          totalDeduplicated++;
          logger.debug("Step: Duplicate skipped", { title });
          continue;
        }

        logger.info("Step: AI processing", { title });
        const [rewrittenContent, seoTitle, summary, tagNames] = await Promise.all(
          [
            rewriteContent(rawContent),
            generateSEOTitle(title),
            generateSummary(rawContent),
            generateTags(rawContent),
          ]
        );

        const tagSlugs = tagNames.map((t) => slugify(t)).filter(Boolean);
        logger.debug("Step: Upserting tags", { tagSlugs });
        const tags = await Promise.all(
          tagSlugs.slice(0, 5).map(async (slug) => {
            return prisma.tag.upsert({
              where: { slug },
              update: {},
              create: { slug, name: slug.replace(/-/g, " ") },
            });
          })
        );

        logger.debug("Step: Resolving category");
        const defaultCategory = await prisma.category.findFirst({
          where: { slug: "tech" },
        });
        const categoryId = defaultCategory?.id;

        if (!categoryId) {
          logger.warn("No default category. Skipping item.", { title });
          continue;
        }

        const baseSlug = slugify(title);
        let slug = baseSlug;
        let suffix = 0;
        while (await prisma.post.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${++suffix}`;
        }
        logger.debug("Step: Creating post", { slug });

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
            canonicalUrl: item.link || null,
            status: "PENDING_APPROVAL",
            categoryId,
            sourceId: source.id,
            tags: {
              create: tags.map((t) => ({ tagId: t.id })),
            },
          },
        });

        logger.debug("Step: Storing content hash");
        await prisma.contentHash.create({
          data: {
            hash,
            sourceId: source.id,
            postId: post.id,
          },
        });

        totalCreated++;
        logger.info("Step: Draft created", { slug: post.slug, title: post.title });
      }

      logger.info("Step: Updating source lastFetched", { source: source.name });
      await prisma.source.update({
        where: { id: source.id },
        data: { lastFetched: new Date() },
      });
    } catch (err) {
      logger.error("Source processing failed", {
        source: source.name,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("Ingestion complete", {
    processed: totalProcessed,
    deduplicated: totalDeduplicated,
    created: totalCreated,
  });
}
