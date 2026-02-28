/**
 * Web scraper adapter - fetches HTML and extracts article content
 * Uses simple regex/string extraction. For production, consider cheerio or puppeteer.
 */

import { fetchWithRetry } from "../lib/fetch.js";
import { logger } from "../lib/logger.js";
import type { IngestionItem, SourceAdapter } from "./types.js";

// Extract text from common article selectors (regex fallback when no DOM parser)
const ARTICLE_PATTERNS = [
  /<article[^>]*>([\s\S]*?)<\/article>/gi,
  /<main[^>]*>([\s\S]*?)<\/main>/gi,
  /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
];

function stripHtml(html: string, maxLen = 10000): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
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
  // Fallback: use body or full HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return stripHtml(bodyMatch?.[1] ?? html);
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripHtml(m[1], 200) : "Untitled";
}

export const scraperAdapter: SourceAdapter = {
  type: "SCRAPER",
  async fetchItems(url: string, _config?: string): Promise<IngestionItem[]> {
    try {
      logger.info("Scraper: Fetching URL", { url });
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        logger.warn("Scraper fetch failed", { url, status: res.status });
        return [];
      }
      logger.debug("Scraper: Extracting content");
      const html = await res.text();
      const content = extractArticleContent(html);
      const title = extractTitle(html);
      if (!content && !title) {
        logger.warn("Scraper: No content extracted", { url });
        return [];
      }
      logger.info("Scraper: Extracted article", { title: title.slice(0, 50) });

      return [
        {
          title: title || "Untitled",
          content: content || title,
          link: url,
          publishedAt: undefined,
        },
      ];
    } catch (err) {
      logger.error("Scraper error", { url, err: String(err) });
      return [];
    }
  },
};
