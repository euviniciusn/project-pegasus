import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { convertImage } from '../services/conversionService.js';
import { downloadFile, uploadFile } from '../storage/objectStorage.js';
import * as jobRepo from '../repositories/jobRepository.js';
import * as jobFileRepo from '../repositories/jobFileRepository.js';
import * as analyticsRepo from '../repositories/analyticsRepository.js';

const QUEUE_NAME = 'image-conversion';

const connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null });

function buildOutputKey(jobId, originalName, outputFormat) {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  return `outputs/${jobId}/${baseName}.${outputFormat}`;
}

async function processConversion(job) {
  const { jobId, fileId, inputKey, outputFormat, options } = job.data;
  const attempt = job.attemptsMade + 1;
  const log = logger.child({ jobId, fileId, attempt });
  const startTime = Date.now();

  if (attempt > 1) {
    log.warn('Retrying conversion');
  }

  log.info({
    outputFormat,
    quality: options?.quality,
    resizeWidth: options?.resizeWidth,
    resizeHeight: options?.resizeHeight,
    resizePercent: options?.resizePercent,
  }, 'Starting conversion');
  await jobFileRepo.updateStatus(fileId, { status: 'processing' });

  const inputBuffer = await downloadFile(inputKey);
  const conversionOpts = { outputFormat, ...options };
  if (outputFormat === 'avif') {
    conversionOpts.avifSpeed = config.conversion.avifSpeed;
  }
  const result = await convertImage(inputBuffer, conversionOpts);

  const file = await jobFileRepo.findById(fileId);
  const outputKey = buildOutputKey(jobId, file.original_name, outputFormat);

  await uploadFile(outputKey, result.buffer, result.metadata.mime);

  await jobFileRepo.updateStatus(fileId, {
    status: 'completed',
    convertedKey: outputKey,
    convertedSize: result.metadata.outputSize,
  });

  await jobRepo.incrementCompletedFiles(jobId);
  await resolveJobStatus(jobId);

  const durationMs = Date.now() - startTime;
  const { inputSize, outputSize } = result.metadata;
  const savingsPercent = inputSize > 0
    ? ((inputSize - outputSize) / inputSize * 100).toFixed(1)
    : '0.0';

  log.info({
    durationMs,
    inputSize,
    outputSize,
    savingsPercent: `${savingsPercent}%`,
    outputKey,
  }, 'Conversion completed');

  analyticsRepo.logConversionEvent({
    inputFormat: file.original_format,
    outputFormat,
    inputSize,
    outputSize,
    savingsPercent: parseFloat(savingsPercent),
    durationMs,
    quality: options?.quality ?? config.conversion.defaultQuality,
  }).catch((err) => log.warn({ err }, 'Failed to log analytics event'));
}

async function handleFailure(job, err) {
  const { jobId, fileId } = job.data;
  const attempt = job.attemptsMade;
  const maxAttempts = job.opts?.attempts ?? 2;
  const log = logger.child({ jobId, fileId });

  log.error({ err, attempt, maxAttempts }, 'Conversion failed');

  await jobFileRepo.updateStatus(fileId, {
    status: 'failed',
    errorMessage: err.message,
  });

  await jobRepo.incrementFailedFiles(jobId);
  await resolveJobStatus(jobId);
}

async function resolveJobStatus(jobId) {
  const job = await jobRepo.findById(jobId);
  if (!job) return;

  const processed = job.completed_files + job.failed_files;
  if (processed < job.total_files) return;

  await jobRepo.updateStatus(jobId, 'completed');

  logger.info({
    jobId,
    totalFiles: job.total_files,
    completed: job.completed_files,
    failed: job.failed_files,
  }, 'Job finished');
}

const worker = new Worker(QUEUE_NAME, processConversion, {
  connection,
  concurrency: config.conversion.concurrency,
  lockDuration: config.conversion.timeout,
});

worker.on('failed', async (job, err) => {
  if (!job) return;
  await handleFailure(job, err);
});

worker.on('ready', () => {
  logger.info({ concurrency: config.conversion.concurrency }, 'Conversion worker started');
});

worker.on('error', (err) => {
  logger.error({ err }, 'Worker error');
});

async function shutdown() {
  logger.info('Shutting down worker...');
  await worker.close();
  await connection.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
