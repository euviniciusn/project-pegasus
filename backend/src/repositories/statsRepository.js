import pool from '../db/connection.js';

export async function getConversionCounts() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= now() - interval '1 day')::int AS today,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS week,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS month,
      COUNT(*)::int AS total
    FROM jobs
  `);
  return rows[0];
}

export async function getBytesProcessed() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(original_size), 0)::bigint AS total_input,
      COALESCE(SUM(converted_size), 0)::bigint AS total_output
    FROM job_files WHERE status = 'completed'
  `);
  return {
    totalInput: Number(rows[0].total_input),
    totalOutput: Number(rows[0].total_output),
  };
}

export async function getFormatDistribution() {
  const { rows } = await pool.query(`
    SELECT output_format AS format, COUNT(*)::int AS count
    FROM jobs
    GROUP BY output_format
    ORDER BY count DESC
  `);
  return rows;
}

export async function getHourlyConversions() {
  const { rows } = await pool.query(`
    SELECT
      date_trunc('hour', created_at) AS hour,
      COUNT(*)::int AS count
    FROM jobs
    WHERE created_at >= now() - interval '24 hours'
    GROUP BY hour
    ORDER BY hour
  `);
  return rows.map((r) => ({ hour: r.hour.toISOString(), count: r.count }));
}

export async function getErrorRate() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
    FROM jobs
    WHERE status IN ('completed', 'failed')
  `);
  return rows[0];
}
