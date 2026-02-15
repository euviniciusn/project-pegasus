import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/index.js';
import { StorageError } from '../errors/index.js';

const { endpoint, port, accessKey, secretKey, bucket, useSSL } = config.minio;
const protocol = useSSL ? 'https' : 'http';

const s3 = new S3Client({
  endpoint: `${protocol}://${endpoint}:${port}`,
  region: 'us-east-1',
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  forcePathStyle: true,
});

function wrapError(action, key, err) {
  if (err instanceof StorageError) throw err;
  throw new StorageError(`Failed to ${action} "${key}": ${err.message}`);
}

export async function uploadFile(key, buffer, contentType) {
  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: buffer, ContentType: contentType,
    }));
  } catch (err) {
    wrapError('upload', key, err);
  }
}

export async function downloadFile(key) {
  try {
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return Buffer.from(await Body.transformToByteArray());
  } catch (err) {
    wrapError('download', key, err);
  }
}

export async function deleteFile(key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    wrapError('delete', key, err);
  }
}

export async function deleteFiles(keys) {
  if (keys.length === 0) return;
  try {
    await s3.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }));
  } catch (err) {
    wrapError('bulk delete', keys.join(', '), err);
  }
}

export async function getPresignedUploadUrl(key, contentType, expiresIn = config.minio.presignedUrlExpiry) {
  try {
    return await getSignedUrl(s3, new PutObjectCommand({
      Bucket: bucket, Key: key, ContentType: contentType,
    }), { expiresIn });
  } catch (err) {
    wrapError('generate upload URL for', key, err);
  }
}

export async function getPresignedDownloadUrl(key, expiresIn = config.minio.presignedUrlExpiry) {
  try {
    return await getSignedUrl(s3, new GetObjectCommand({
      Bucket: bucket, Key: key,
    }), { expiresIn });
  } catch (err) {
    wrapError('generate download URL for', key, err);
  }
}

export async function fileExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false;
    wrapError('check existence of', key, err);
  }
}
