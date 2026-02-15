import * as jobController from '../controllers/jobController.js';

const uuidPattern = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

const fileSchema = {
  type: 'object',
  required: ['name', 'size', 'type'],
  properties: {
    name: { type: 'string', minLength: 1 },
    size: { type: 'integer', minimum: 1 },
    type: { type: 'string', minLength: 1 },
  },
};

const createJobSchema = {
  body: {
    type: 'object',
    required: ['files', 'outputFormat'],
    properties: {
      files: { type: 'array', items: fileSchema, minItems: 1 },
      outputFormat: { type: 'string', enum: ['webp', 'jpg', 'png'] },
      quality: { type: 'integer', minimum: 1, maximum: 100 },
    },
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
  fastify.post('/', { schema: createJobSchema }, jobController.createJob);
  fastify.post('/:id/start', { schema: jobIdParamsSchema }, jobController.startJob);
  fastify.get('/:id', { schema: jobIdParamsSchema }, jobController.getJobStatus);
  fastify.get('/:id/download/:fileId', { schema: downloadParamsSchema }, jobController.downloadFile);

  done();
}

export default jobRoutes;
