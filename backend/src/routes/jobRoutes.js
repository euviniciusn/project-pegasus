import * as jobController from '../controllers/jobController.js';

const uuidPattern = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

const fileSchema = {
  type: 'object',
  required: ['name', 'size', 'type'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    size: { type: 'integer', minimum: 1 },
    type: { type: 'string', enum: ['image/png', 'image/jpeg'] },
  },
};

const createJobSchema = {
  body: {
    type: 'object',
    required: ['files', 'outputFormat'],
    properties: {
      files: { type: 'array', items: fileSchema, minItems: 1, maxItems: 20 },
      outputFormat: { type: 'string', enum: ['webp', 'jpg', 'png', 'avif'] },
      quality: { type: 'integer', minimum: 1, maximum: 100 },
      width: { type: 'integer', minimum: 1, maximum: 16383 },
      height: { type: 'integer', minimum: 1, maximum: 16383 },
      resizePercent: { type: 'integer', minimum: 1, maximum: 100 },
    },
    additionalProperties: false,
  },
};

const jobIdParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', pattern: uuidPattern } },
  },
};

const downloadParamsSchema = {
  params: {
    type: 'object',
    required: ['id', 'fileId'],
    properties: {
      id: { type: 'string', pattern: uuidPattern },
      fileId: { type: 'string', pattern: uuidPattern },
    },
  },
};

function jobRoutes(fastify, _opts, done) {
  fastify.post('/', {
    schema: createJobSchema,
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, jobController.createJob);

  const startJobSchema = {
    ...jobIdParamsSchema,
  };

  fastify.post('/:id/start', {
    schema: startJobSchema,
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, jobController.startJob);

  fastify.get('/:id', {
    schema: jobIdParamsSchema,
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  }, jobController.getJobStatus);

  fastify.get('/:id/download/:fileId', {
    schema: downloadParamsSchema,
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, jobController.downloadFile);

  fastify.get('/:id/download-all', {
    schema: jobIdParamsSchema,
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, jobController.downloadAll);

  done();
}

export default jobRoutes;
