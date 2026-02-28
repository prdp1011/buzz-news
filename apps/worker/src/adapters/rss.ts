/**
 * RSS Feed adapter
 */

import { XMLParser } from "fast-xml-parser";
import { fetchWithRetry } from "../lib/fetch.js";
import { logger } from "../lib/logger.js";
import type { IngestionItem, SourceAdapter } from "./types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export const rssAdapter: SourceAdapter = {
  type: "RSS",
  async fetchItems(url: string): Promise<IngestionItem[]> {
    logger.info("RSS: Fetching feed", { url });
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      logger.warn("RSS fetch failed", { url, status: res.status });
      return [];
    }
    logger.debug("RSS: Parsing XML");
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const channel = parsed.rss?.channel ?? parsed.feed ?? parsed;
    const rawItems = channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
    logger.info("RSS: Parsed items", { count: items.length });

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
  },
};
