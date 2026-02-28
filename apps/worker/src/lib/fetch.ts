/**
 * Production-ready fetch with retries and SSL handling
 */

import fetch from "node-fetch";
import type { RequestInit, Response } from "node-fetch";
import { logger } from "./logger.js";

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const USER_AGENT =
  "GenZNewsBot/1.0 (+https://genznews.com; ingestion)";

export interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Fetch with exponential backoff retries.
 * Set NODE_TLS_REJECT_UNAUTHORIZED=0 for dev (corporate proxies) - NOT for production.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = DEFAULT_RETRIES, retryDelay = RETRY_DELAY_MS, ...init } = options;
  const headers = {
    "User-Agent": USER_AGENT,
    ...(init.headers as Record<string, string>),
  };

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers });
      if (res.ok || attempt === retries) return res;
      if (res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}`);
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt);
          logger.warn("Fetch retry", {
            url,
            attempt: attempt + 1,
            status: res.status,
            retryInMs: delay,
          });
          await sleep(delay);
        }
        continue;
      }
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        logger.warn("Fetch retry (error)", {
          url,
          attempt: attempt + 1,
          err: lastError.message,
          retryInMs: delay,
        });
        await sleep(delay);
      } else {
        throw lastError;
      }
    }
  }
  throw lastError ?? new Error("Fetch failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
