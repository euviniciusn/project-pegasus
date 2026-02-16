import * as limitsController from '../controllers/limitsController.js';

function limitsRoutes(fastify, _opts, done) {
  fastify.get('/', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, limitsController.getLimits);

  done();
}

export default limitsRoutes;
