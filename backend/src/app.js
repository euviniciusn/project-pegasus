import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import config from './config/index.js';
import sessionPlugin from './middleware/session.js';
import errorHandlerPlugin from './middleware/errorHandler.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import limitsRoutes from './routes/limitsRoutes.js';
import { checkHealth } from './services/healthService.js';

const isDev = config.server.nodeEnv === 'development';
const startedAt = Date.now();

function resolveTransport() {
  if (!isDev) return undefined;
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
    level: isDev ? 'debug' : 'info',
    ...(transport && { transport }),
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          ip: request.ip,
        };
      },
      res(reply) {
        return { statusCode: reply.statusCode };
      },
    },
  },
});

await app.register(cors, {
  origin: config.server.allowedOrigins.split(','),
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Cookie', 'X-Admin-Key'],
});

await app.register(cookie, {
  secret: config.server.cookieSecret,
});

await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: config.server.nodeEnv === 'production',
});

await app.register(rateLimit, {
  global: false,
  keyGenerator: (request) => request.ip,
});

await app.register(errorHandlerPlugin);
await app.register(sessionPlugin);
await app.register(jobRoutes, { prefix: '/api/jobs' });
await app.register(adminRoutes, { prefix: '/api/admin' });
await app.register(limitsRoutes, { prefix: '/api/limits' });

app.get('/health', { config: { rateLimit: false } }, async () => {
  const services = await checkHealth();
  const uptime = Math.floor((Date.now() - startedAt) / 1000);

  return {
    status: services.database && services.redis && services.storage ? 'ok' : 'degraded',
    services,
    uptime,
    version: '0.1.0',
  };
});

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
