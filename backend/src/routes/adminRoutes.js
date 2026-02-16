import config from '../config/index.js';
import * as statsController from '../controllers/statsController.js';

function adminRoutes(fastify, _opts, done) {
  fastify.addHook('onRequest', (request, reply, hookDone) => {
    const key = request.headers['x-admin-key'];

    if (!config.admin.key || key !== config.admin.key) {
      reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid admin key' },
      });
      return;
    }

    hookDone();
  });

  fastify.get('/stats', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, statsController.getStats);

  done();
}

export default adminRoutes;
