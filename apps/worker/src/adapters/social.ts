/**
 * Social API adapter - placeholder for Twitter/X, Reddit, etc.
 * Add API keys in source config (JSON) when integrating.
 */

import { logger } from "../lib/logger.js";
import type { IngestionItem, SourceAdapter } from "./types.js";

export const socialAdapter: SourceAdapter = {
  type: "SOCIAL",
  async fetchItems(url: string, config?: string): Promise<IngestionItem[]> {
    // Placeholder: parse config for API keys, call social APIs
    // Example config: {"apiKey":"...","platform":"twitter"}
    logger.info("Social adapter not yet implemented", { url, hasConfig: !!config });
    return [];
  },
};
