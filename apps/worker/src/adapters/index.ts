/**
 * Source adapter factory
 */

import type { SourceType } from "database";
import { rssAdapter } from "./rss.js";
import { scraperAdapter } from "./scraper.js";
import { socialAdapter } from "./social.js";
import type { SourceAdapter } from "./types.js";

const adapters: Record<string, SourceAdapter> = {
  RSS: rssAdapter,
  SCRAPER: scraperAdapter,
  SOCIAL: socialAdapter,
};

export function getAdapter(type: SourceType): SourceAdapter {
  const adapter = adapters[type] ?? rssAdapter;
  return adapter;
}

export { rssAdapter, scraperAdapter, socialAdapter };
export type { IngestionItem, SourceAdapter } from "./types.js";
