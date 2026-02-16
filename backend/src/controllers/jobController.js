import * as jobService from '../services/jobService.js';
import * as usageLimitService from '../services/usageLimitService.js';
import config from '../config/index.js';
import { ValidationError, FileTooLargeError } from '../errors/index.js';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];
const ALLOWED_OUTPUT_FORMATS = ['png', 'jpg', 'webp', 'avif'];
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

  if (files.length > config.limits.maxFilesPerJob) {
    throw new ValidationError(
      `Máximo de ${config.limits.maxFilesPerJob} arquivos por conversão (enviados: ${files.length})`,
    );
  }

  let totalSize = 0;
  const maxSize = config.limits.maxFileSize;

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(
        `Invalid MIME type "${file.type}" for "${file.name}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > maxSize) {
      throw new FileTooLargeError(file.size, maxSize);
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

function validateResizeOptions({ width, height, resizePercent }) {
  const hasPixelResize = width !== undefined || height !== undefined;
  const hasPercentResize = resizePercent !== undefined;

  if (hasPixelResize && hasPercentResize) {
    throw new ValidationError('Cannot specify both pixel dimensions and resize percentage');
  }
}

async function checkDailyLimit(sessionToken) {
  const used = await usageLimitService.getDailyUsage(sessionToken);
  const max = config.limits.maxConversionsPerDay;

  if (used >= max) {
    throw new ValidationError(
      `Limite diário de ${max} conversões atingido. Tente novamente amanhã.`,
    );
  }
}

export async function createJob(request, reply) {
  const { files, outputFormat, quality, width, height, resizePercent } = request.body;

  await checkDailyLimit(request.sessionToken);
  validateFiles(files);
  validateOutputFormat(outputFormat);
  validateResizeOptions({ width, height, resizePercent });

  const result = await jobService.createJob({
    sessionToken: request.sessionToken,
    files,
    outputFormat,
    quality,
    resizeWidth: width,
    resizeHeight: height,
    resizePercent,
  });

  await usageLimitService.incrementDailyUsage(request.sessionToken);

  return reply.status(201).send({
    success: true,
    data: { jobId: result.jobId, uploadUrls: result.uploadUrls },
  });
}

export async function startJob(request, reply) {
  const { id } = request.params;
  const excludeFileIds = request.body?.excludeFileIds;

  await jobService.startJob(id, request.sessionToken, excludeFileIds);

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

export async function downloadAll(request, reply) {
  const { id } = request.params;

  const archive = await jobService.streamZipDownload(id, request.sessionToken);

  const timestamp = Date.now();
  const fileName = `vecta-convert-${timestamp}.zip`;

  reply.header('Content-Type', 'application/zip');
  reply.header('Content-Disposition', `attachment; filename="${fileName}"`);

  return reply.send(archive);
}
