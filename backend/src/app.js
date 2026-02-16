import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import config from './config/index.js';
import sessionPlugin from './middleware/session.js';
import errorHandlerPlugin from './middleware/errorHandler.js';
import jobRoutes from './routes/jobRoutes.js';

function resolveTransport() {
  if (config.server.nodeEnv !== 'development') return undefined;
  try {
    import.meta.resolve('pino-pretty');
    return { target: 'pino-pretty', options: { colorize: true } };
  } catch {
    return undefined;
  }
}

const transport = resolveTransport();

const app = Fastify({
  logger: {
    level: config.server.logLevel,
    ...(transport && { transport }),
  },
});

await app.register(cors, {
  origin: config.server.allowedOrigins.split(','),
  credentials: true,
});

await app.register(cookie, {
  secret: config.server.cookieSecret,
});

await app.register(helmet);

await app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  timeWindow: '1 minute',
});

await app.register(errorHandlerPlugin);
await app.register(sessionPlugin);
await app.register(jobRoutes, { prefix: '/api/jobs' });

app.get('/health', async () => ({ status: 'ok' }));

async function start() {
  try {
    await app.listen({ port: config.server.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

function shutdown() {
  app.log.info('Shutting down server...');
  app.close().then(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await start();
