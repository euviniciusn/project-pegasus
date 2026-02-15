import pino from 'pino';
import config from '../config/index.js';

const isDev = config.server.nodeEnv === 'development';

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

const logger = pino({
  level: config.server.logLevel,
  ...(transport && { transport }),
});

export default logger;
