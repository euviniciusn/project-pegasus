import IORedis from 'ioredis';
import config from '../config/index.js';

const redisClient = new IORedis(config.redis.url, { maxRetriesPerRequest: null });

export default redisClient;
