import redis from '../db/redisClient.js';
import config from '../config/index.js';

const DAY_IN_SECONDS = 86400;

function dailyKey(sessionToken) {
  return `daily_usage:${sessionToken}`;
}

export async function getDailyUsage(sessionToken) {
  const value = await redis.get(dailyKey(sessionToken));
  return value ? parseInt(value, 10) : 0;
}

export async function incrementDailyUsage(sessionToken) {
  const key = dailyKey(sessionToken);
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, DAY_IN_SECONDS);
  }

  return count;
}

export async function getLimits(sessionToken) {
  const used = await getDailyUsage(sessionToken);

  return {
    used,
    maxConversionsPerDay: config.limits.maxConversionsPerDay,
    maxFileSize: config.limits.maxFileSize,
    maxFilesPerJob: config.limits.maxFilesPerJob,
  };
}
