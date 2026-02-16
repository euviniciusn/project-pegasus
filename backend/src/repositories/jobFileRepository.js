import pool from '../db/connection.js';

export async function createJobFile({ jobId, originalName, originalKey, originalSize, originalFormat }) {
  const { rows } = await pool.query(
    `INSERT INTO job_files (job_id, original_name, original_key, original_size, original_format)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [jobId, originalName, originalKey, originalSize, originalFormat],
  );
  return rows[0];
}

export async function findByJobId(jobId) {
  const { rows } = await pool.query(
    'SELECT * FROM job_files WHERE job_id = $1 ORDER BY created_at',
    [jobId],
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM job_files WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

export async function updateStatus(id, {
  status,
  convertedKey,
  convertedSize,
  errorMessage,
}) {
  const fields = ['status = $2', 'updated_at = now()'];
  const values = [id, status];
  let idx = 3;

  const optional = [
    ['converted_key', convertedKey],
    ['converted_size', convertedSize],
    ['error_message', errorMessage],
  ];

  for (const [column, value] of optional) {
    if (value === undefined) continue;
    fields.push(`${column} = $${idx}`);
    values.push(value);
    idx++;
  }

  const { rows } = await pool.query(
    `UPDATE job_files SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    values,
  );
  return rows[0] || null;
}

export async function countByJobIdAndStatus(jobId, status) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM job_files WHERE job_id = $1 AND status = $2',
    [jobId, status],
  );
  return rows[0].count;
}

export async function findCompletedByJobId(jobId) {
  const { rows } = await pool.query(
    "SELECT id, original_name, converted_key FROM job_files WHERE job_id = $1 AND status = 'completed' ORDER BY created_at",
    [jobId],
  );
  return rows;
}

export async function findByJobIdWithStatus(jobId) {
  const { rows } = await pool.query(
    'SELECT id, original_name, original_size, status, converted_size, error_message FROM job_files WHERE job_id = $1 ORDER BY created_at',
    [jobId],
  );
  return rows;
}
