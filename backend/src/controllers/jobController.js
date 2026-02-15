import * as jobService from '../services/jobService.js';
import config from '../config/index.js';
import { ValidationError, FileTooLargeError } from '../errors/index.js';

const ALLOWED_FORMATS = ['png', 'jpg', 'webp'];

function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new ValidationError('At least one file is required');
  }

  if (files.length > config.upload.maxFilesPerJob) {
    throw new ValidationError(
      `Maximum ${config.upload.maxFilesPerJob} files per job (got ${files.length})`,
    );
  }

  for (const file of files) {
    if (file.size > config.upload.maxFileSize) {
      throw new FileTooLargeError(file.size, config.upload.maxFileSize);
    }
  }
}

function validateOutputFormat(format) {
  if (!ALLOWED_FORMATS.includes(format)) {
    throw new ValidationError(
      `Invalid output format "${format}". Allowed: ${ALLOWED_FORMATS.join(', ')}`,
    );
  }
}

export async function createJob(request, reply) {
  const { files, outputFormat, quality } = request.body;

  validateFiles(files);
  validateOutputFormat(outputFormat);

  const result = await jobService.createJob({
    sessionToken: request.sessionToken,
    files,
    outputFormat,
    quality,
  });

  return reply.status(201).send({
    success: true,
    data: { jobId: result.jobId, uploadUrls: result.uploadUrls },
  });
}

export async function startJob(request, reply) {
  const { id } = request.params;

  await jobService.startJob(id, request.sessionToken);

  return reply.send({
    success: true,
    data: { message: 'Processing started' },
  });
}

export async function getJobStatus(request, reply) {
  const { id } = request.params;

  const result = await jobService.getJobStatus(id, request.sessionToken);

  return reply.send({
    success: true,
    data: { job: result.job, files: result.files },
  });
}

export async function downloadFile(request, reply) {
  const { id, fileId } = request.params;

  const result = await jobService.getDownloadUrl(id, fileId, request.sessionToken);

  return reply.send({
    success: true,
    data: { url: result.url, fileName: result.fileName },
  });
}
