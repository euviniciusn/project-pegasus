import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config/index.js';

const QUEUE_NAME = 'image-conversion';

const connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null });

export const conversionQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export async function addConversionJob({ jobId, fileId, inputKey, outputFormat, options }) {
  return conversionQueue.add(
    `convert-${fileId}`,
    { jobId, fileId, inputKey, outputFormat, options },
  );
}
