import pool from '../db/connection.js';
import config from '../config/index.js';

export async function createJob({ sessionToken, outputFormat, quality, fileCount }) {
  const expiresAt = new Date(Date.now() + config.session.ttl * 1000);

  const { rows } = await pool.query(
    `INSERT INTO jobs (session_token, output_format, quality, total_files, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sessionToken, outputFormat, quality ?? config.conversion.defaultQuality, fileCount, expiresAt],
  );

  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM jobs WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

export async function findByIdAndSession(id, sessionToken) {
  const { rows } = await pool.query(
    'SELECT * FROM jobs WHERE id = $1 AND session_token = $2',
    [id, sessionToken],
  );
  return rows[0] || null;
}

export async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE jobs SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [status, id],
  );
  return rows[0] || null;
}

export async function incrementCompletedFiles(id) {
  const { rows } = await pool.query(
    `UPDATE jobs SET completed_files = completed_files + 1, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id],
  );
  return rows[0] || null;
}

export async function incrementFailedFiles(id) {
  const { rows } = await pool.query(
    `UPDATE jobs SET failed_files = failed_files + 1, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id],
  );
  return rows[0] || null;
}

export async function findExpiredJobs() {
  const { rows } = await pool.query(
    "SELECT * FROM jobs WHERE expires_at < now() AND status NOT IN ('failed')",
  );
  return rows;
}

export async function markAsExpired(id) {
  const { rows } = await pool.query(
    `UPDATE jobs SET status = 'failed', updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id],
  );
  return rows[0] || null;
}
