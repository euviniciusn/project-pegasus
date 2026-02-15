import logger from '../utils/logger.js';
import { cleanExpiredJobs } from '../services/cleanupService.js';

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

async function runCleanup() {
  logger.info('Running scheduled cleanup');
  try {
    const cleaned = await cleanExpiredJobs();
    logger.info({ cleaned }, 'Scheduled cleanup completed');
  } catch (err) {
    logger.error({ err }, 'Scheduled cleanup failed');
  }
}

// Run immediately on startup, then every 30 minutes
await runCleanup();
setInterval(runCleanup, CLEANUP_INTERVAL_MS);

logger.info(
  { intervalMinutes: CLEANUP_INTERVAL_MS / 60_000 },
  'Cleanup worker started',
);

function shutdown() {
  logger.info('Shutting down cleanup worker...');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
