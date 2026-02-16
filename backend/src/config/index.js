import { config as dotenvConfig } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: resolve(__dirname, '../../../.env') });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    cookieSecret: requireEnv('COOKIE_SECRET'),
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  },

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  redis: {
    url: requireEnv('REDIS_URL'),
  },

  minio: {
    endpoint: requireEnv('MINIO_ENDPOINT'),
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    accessKey: requireEnv('MINIO_ACCESS_KEY'),
    secretKey: requireEnv('MINIO_SECRET_KEY'),
    bucket: process.env.MINIO_BUCKET || 'converter',
    useSSL: process.env.MINIO_USE_SSL === 'true',
    presignedUrlExpiry: parseInt(process.env.PRESIGNED_URL_EXPIRY, 10) || 3600,
    publicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost/storage',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 20 * 1024 * 1024,
    maxFilesPerJob: parseInt(process.env.MAX_FILES_PER_JOB, 10) || 20,
  },

  session: {
    ttl: parseInt(process.env.SESSION_TTL, 10) || 7200,
  },

  conversion: {
    defaultQuality: parseInt(process.env.DEFAULT_QUALITY, 10) || 82,
    timeout: parseInt(process.env.CONVERSION_TIMEOUT, 10) || 30000,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY, 10) || 4,
  },
};

export default config;
