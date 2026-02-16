import logger from '../utils/logger.js';
import * as jobRepo from '../repositories/jobRepository.js';
import * as jobFileRepo from '../repositories/jobFileRepository.js';
import { deleteFiles } from '../storage/objectStorage.js';

function collectStorageKeys(files) {
  const keys = [];
  for (const file of files) {
    if (file.original_key) keys.push(file.original_key);
    if (file.converted_key) keys.push(file.converted_key);
  }
  return keys;
}

async function cleanSingleJob(job) {
  const log = logger.child({ jobId: job.id });

  const files = await jobFileRepo.findByJobId(job.id);
  const keys = collectStorageKeys(files);

  if (keys.length > 0) {
    await deleteFiles(keys);
    log.info({ deletedKeys: keys.length, fileCount: files.length }, 'Deleted storage files');
  }

  await jobRepo.markAsExpired(job.id);
  log.info('Job marked as expired');

  return { files: files.length, storageKeys: keys.length };
}

export async function cleanExpiredJobs() {
  const startTime = Date.now();
  const expiredJobs = await jobRepo.findExpiredJobs();

  if (expiredJobs.length === 0) {
    logger.debug('No expired jobs found');
    return 0;
  }

  logger.info({ jobCount: expiredJobs.length }, 'Found expired jobs to clean');

  let cleanedJobs = 0;
  let cleanedFiles = 0;
  let cleanedKeys = 0;

  for (const job of expiredJobs) {
    try {
      const counts = await cleanSingleJob(job);
      cleanedJobs++;
      cleanedFiles += counts.files;
      cleanedKeys += counts.storageKeys;
    } catch (err) {
      logger.error({ err, jobId: job.id }, 'Failed to clean expired job');
    }
  }

  const durationMs = Date.now() - startTime;

  logger.info({
    durationMs,
    cleanedJobs,
    cleanedFiles,
    cleanedKeys,
    failedJobs: expiredJobs.length - cleanedJobs,
  }, 'Cleanup finished');

  return cleanedJobs;
}
