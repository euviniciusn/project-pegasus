import pool from '../db/connection.js';
import IORedis from 'ioredis';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import config from '../config/index.js';

const { endpoint, port, accessKey, secretKey, bucket, useSSL } = config.minio;
const protocol = useSSL ? 'https' : 'http';

const s3 = new S3Client({
  endpoint: `${protocol}://${endpoint}:${port}`,
  region: 'us-east-1',
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  forcePathStyle: true,
});

async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

async function checkRedis() {
  let client;
  try {
    client = new IORedis(config.redis.url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });
    await client.connect();
    await client.ping();
    return true;
  } catch {
    return false;
  } finally {
    client?.disconnect();
  }
}

async function checkStorage() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    return true;
  } catch {
    return false;
  }
}

export async function checkHealth() {
  const [database, redis, storage] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
  ]);

  return { database, redis, storage };
}
