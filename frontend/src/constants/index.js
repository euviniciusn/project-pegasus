export const ACCEPTED_INPUT_FORMATS = ['image/png', 'image/jpeg'];

export const OUTPUT_FORMATS = ['webp', 'png', 'jpg'];

export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const MAX_FILES_PER_JOB = 20;

export const DEFAULT_QUALITY = 82;

export const POLLING_INTERVAL = 1500;

export const FILE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
