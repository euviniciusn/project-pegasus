import pg from 'pg';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const pool = new pg.Pool({
  connectionString: config.database.url,
  max: 10,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

export default pool;
