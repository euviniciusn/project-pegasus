export const ACCEPTED_INPUT_FORMATS = ['image/png', 'image/jpeg'];

export const OUTPUT_FORMATS = ['webp', 'png', 'jpg', 'avif'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const MAX_FILES_PER_JOB = 5;

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

export const MAX_CONCURRENT_UPLOADS = 3;

export const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const RESIZE_PRESETS = [
  { value: 'original', label: 'Manter original' },
  { value: '50', label: '50%' },
  { value: '25', label: '25%' },
  { value: 'custom', label: 'Personalizado' },
];

export const RESIZE_PRESETS_PAGE = [
  { value: '50', label: '50%' },
  { value: '25', label: '25%' },
  { value: '1080', label: '1080px' },
  { value: '720', label: '720px' },
  { value: 'custom', label: 'Personalizado' },
];

export const MIME_TO_FORMAT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
