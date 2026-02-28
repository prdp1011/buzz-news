/**
 * Gen Z News - Content Ingestion Worker
 *
 * Cron-ready structure. Run via:
 * - node dist/index.js (continuous loop with interval)
 * - pnpm ingest (one-shot for manual/cron trigger)
 *
 * Set CRON_INTERVAL_MS for loop interval (default: 1 hour)
 */

const CRON_INTERVAL_MS = parseInt(
  process.env.CRON_INTERVAL_MS ?? "3600000",
  10
);

async function run() {
  console.log(`[${new Date().toISOString()}] Starting ingestion...`);
  try {
    const { runIngestion } = await import("./ingest.js");
    await runIngestion();
    console.log(`[${new Date().toISOString()}] Ingestion complete.`);
  } catch (err) {
    console.error("Ingestion failed:", err);
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
  console.log(
    `Worker running. Next run in ${CRON_INTERVAL_MS / 1000}s. Use --once for one-shot.`
  );
}
