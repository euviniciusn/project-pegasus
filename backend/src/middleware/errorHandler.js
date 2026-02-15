import fp from 'fastify-plugin';
import { AppError } from '../errors/index.js';

function handleAppError(error, reply) {
  return reply.status(error.statusCode).send({
    success: false,
    error: { code: error.code, message: error.message },
  });
}

function handleValidationError(error, reply) {
  return reply.status(422).send({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: error.message },
  });
}

function handleRateLimitError(reply) {
  return reply.status(429).send({
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' },
  });
}

function errorHandlerPlugin(fastify, _opts, done) {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return handleAppError(error, reply);
    }

    if (error.validation) {
      return handleValidationError(error, reply);
    }

    if (error.statusCode === 429) {
      return handleRateLimitError(reply);
    }

    request.log.error({ err: error }, 'Unhandled error');

    return reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  done();
}

export default fp(errorHandlerPlugin, { name: 'error-handler' });
