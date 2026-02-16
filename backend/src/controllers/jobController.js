import * as jobService from '../services/jobService.js';
import config from '../config/index.js';
import { ValidationError, FileTooLargeError } from '../errors/index.js';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];
const ALLOWED_OUTPUT_FORMATS = ['png', 'jpg', 'webp'];
const DANGEROUS_FILENAME_PATTERN = /[<>:"/\\|?*\x00-\x1f]|\.{2,}/;

function sanitizeFileName(name) {
  if (DANGEROUS_FILENAME_PATTERN.test(name)) {
    throw new ValidationError(`Invalid file name: "${name}"`);
  }

  const basename = name.split('/').pop().split('\\').pop();
  if (!basename || basename.startsWith('.')) {
    throw new ValidationError(`Invalid file name: "${name}"`);
  }

  return basename;
}

function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new ValidationError('At least one file is required');
  }

  if (files.length > config.upload.maxFilesPerJob) {
    throw new ValidationError(
      `Maximum ${config.upload.maxFilesPerJob} files per job (got ${files.length})`,
    );
  }

  let totalSize = 0;

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(
        `Invalid MIME type "${file.type}" for "${file.name}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > config.upload.maxFileSize) {
      throw new FileTooLargeError(file.size, config.upload.maxFileSize);
    }

    totalSize += file.size;
    file.name = sanitizeFileName(file.name);
  }

  if (totalSize > config.upload.maxTotalJobSize) {
    const totalMB = (totalSize / 1024 / 1024).toFixed(1);
    const limitMB = (config.upload.maxTotalJobSize / 1024 / 1024).toFixed(0);
    throw new ValidationError(
      `Total job size ${totalMB}MB exceeds ${limitMB}MB limit`,
    );
  }
}

function validateOutputFormat(format) {
  if (!ALLOWED_OUTPUT_FORMATS.includes(format)) {
    throw new ValidationError(
      `Invalid output format "${format}". Allowed: ${ALLOWED_OUTPUT_FORMATS.join(', ')}`,
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
