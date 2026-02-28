/**
 * Source adapter types - unified interface for RSS, Social, Scraper
 */

export type SourceType = "RSS" | "SOCIAL" | "SCRAPER";

export interface IngestionItem {
  title: string;
  content: string;
  link?: string;
  publishedAt?: Date;
  guid?: string;
}

export interface SourceAdapter {
  type: SourceType;
  fetchItems(url: string, config?: string): Promise<IngestionItem[]>;
}
