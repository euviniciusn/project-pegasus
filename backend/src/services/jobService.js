import archiver from 'archiver';
import * as jobRepo from '../repositories/jobRepository.js';
import * as jobFileRepo from '../repositories/jobFileRepository.js';
import { addConversionJob } from '../queue/conversionQueue.js';
import { getPresignedUploadUrl, getPresignedDownloadUrl, downloadFileAsStream, fileExists } from '../storage/objectStorage.js';
import { NotFoundError, ValidationError } from '../errors/index.js';

function buildInputKey(jobId, fileName) {
  return `inputs/${jobId}/${fileName}`;
}

function extractFormat(mimeType) {
  const map = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
  return map[mimeType] || null;
}

async function findJobOrFail(jobId, sessionToken) {
  const job = await jobRepo.findByIdAndSession(jobId, sessionToken);
  if (!job) throw new NotFoundError('Job');
  return job;
}

async function createFileAndUploadUrl(jobId, file, outputFormat) {
  const inputKey = buildInputKey(jobId, file.name);
  const originalFormat = extractFormat(file.type);

  const jobFile = await jobFileRepo.createJobFile({
    jobId,
    originalName: file.name,
    originalKey: inputKey,
    originalSize: file.size,
    originalFormat,
  });

  const url = await getPresignedUploadUrl(inputKey, file.type);

  return { fileId: jobFile.id, url, key: inputKey };
}

export async function createJob({ sessionToken, files, outputFormat, quality }) {
  const job = await jobRepo.createJob({
    sessionToken,
    outputFormat,
    quality,
    fileCount: files.length,
  });

  const uploadUrls = await Promise.all(
    files.map((file) => createFileAndUploadUrl(job.id, file, outputFormat)),
  );

  return { jobId: job.id, uploadUrls };
}

async function verifyFilesUploaded(files) {
  const checks = await Promise.all(
    files.map((file) => fileExists(file.original_key)),
  );

  const missing = files.filter((_, i) => !checks[i]);
  if (missing.length > 0) {
    const names = missing.map((f) => f.original_name).join(', ');
    throw new ValidationError(`Files not yet uploaded: ${names}`);
  }
}

async function enqueueFiles(job, files) {
  const jobs = files.map((file) =>
    addConversionJob({
      jobId: job.id,
      fileId: file.id,
      inputKey: file.original_key,
      outputFormat: job.output_format,
      options: { quality: job.quality },
    }),
  );
  await Promise.all(jobs);
}

export async function startJob(jobId, sessionToken) {
  const job = await findJobOrFail(jobId, sessionToken);

  if (job.status !== 'pending') {
    throw new ValidationError(`Job cannot be started (current status: ${job.status})`);
  }

  const files = await jobFileRepo.findByJobId(jobId);
  await verifyFilesUploaded(files);

  await jobRepo.updateStatus(jobId, 'processing');
  await enqueueFiles(job, files);
}

export async function getJobStatus(jobId, sessionToken) {
  const job = await findJobOrFail(jobId, sessionToken);
  const files = await jobFileRepo.findByJobIdWithStatus(jobId);

  return { job, files };
}

export async function getDownloadUrl(jobId, fileId, sessionToken) {
  await findJobOrFail(jobId, sessionToken);

  const file = await jobFileRepo.findById(fileId);
  if (!file || file.job_id !== jobId) throw new NotFoundError('File');

  if (file.status !== 'completed') {
    throw new ValidationError(`File is not ready for download (status: ${file.status})`);
  }

  const url = await getPresignedDownloadUrl(file.converted_key);
  return { url, fileName: file.original_name };
}

function replaceExtension(fileName, format) {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}.${format}`;
}

export async function streamZipDownload(jobId, sessionToken) {
  const job = await findJobOrFail(jobId, sessionToken);

  if (job.status !== 'completed') {
    throw new ValidationError(`Job is not completed (status: ${job.status})`);
  }

  const files = await jobFileRepo.findCompletedByJobId(jobId);
  if (files.length === 0) {
    throw new ValidationError('No completed files to download');
  }

  const archive = archiver('zip', { zlib: { level: 1 } });

  for (const file of files) {
    const stream = await downloadFileAsStream(file.converted_key);
    const outputName = replaceExtension(file.original_name, job.output_format);
    archive.append(stream, { name: outputName });
  }

  archive.finalize();

  return archive;
}
