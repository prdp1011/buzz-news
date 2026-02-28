/**
 * Gen Z News - Content Ingestion Worker
 *
 * Cron-ready structure. Run via:
 * - node dist/index.js (continuous loop with interval)
 * - pnpm ingest (one-shot for manual/cron trigger)
 *
 * Set CRON_INTERVAL_MS for loop interval (default: 1 hour)
 */

import { logger } from "./lib/logger.js";

const CRON_INTERVAL_MS = parseInt(
  process.env.CRON_INTERVAL_MS ?? "3600000",
  10
);

async function run() {
  logger.info("Starting ingestion");
  try {
    const { runIngestion } = await import("./ingest.js");
    await runIngestion();
    logger.info("Ingestion complete");
  } catch (err) {
    logger.error("Ingestion failed", {
      err: err instanceof Error ? err.message : String(err),
    });
    process.exitCode = 1;
  }
}

// One-shot mode (for cron: pnpm ingest)
if (process.argv.includes("--once")) {
  run().then(() => process.exit(0));
} else {
  // Continuous mode
  run();
  setInterval(run, CRON_INTERVAL_MS);
  logger.info("Worker running (continuous)", {
    intervalSeconds: CRON_INTERVAL_MS / 1000,
    hint: "Use --once for one-shot",
  });
}
