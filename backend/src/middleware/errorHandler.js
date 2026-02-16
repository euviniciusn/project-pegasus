import fp from 'fastify-plugin';
import { AppError } from '../errors/index.js';

function errorHandlerPlugin(fastify, _opts, done) {
  fastify.setErrorHandler((error, request, reply) => {
    const { ip, method, url } = request;

    if (error instanceof AppError) {
      if (error.statusCode >= 400 && error.statusCode < 500) {
        request.log.warn({ ip, method, url, code: error.code }, error.message);
      }
      return reply.status(error.statusCode).send({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }

    if (error.validation) {
      request.log.warn({ ip, method, url, code: 'VALIDATION_ERROR' }, error.message);
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }

    if (error.statusCode === 429) {
      request.log.warn({ ip, method, url, code: 'RATE_LIMIT' }, 'Rate limit exceeded');
      return reply.status(429).send({
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' },
      });
    }

    request.log.error({ err: error, ip, method, url }, 'Unhandled error');

    return reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  done();
}

export default fp(errorHandlerPlugin, { name: 'error-handler' });
