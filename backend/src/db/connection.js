import pg from 'pg';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const pool = new pg.Pool({
  connectionString: config.database.url,
  min: config.database.poolMin,
  max: config.database.poolMax,
  statement_timeout: config.database.statementTimeout,
  idle_in_transaction_session_timeout: 30000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

export default pool;
