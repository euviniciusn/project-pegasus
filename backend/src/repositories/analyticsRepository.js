import pool from '../db/connection.js';

export async function logConversionEvent({
  inputFormat, outputFormat, inputSize, outputSize,
  savingsPercent, durationMs, quality,
}) {
  await pool.query(
    `INSERT INTO analytics_events
       (event_type, input_format, output_format, input_size, output_size, savings_percent, duration_ms, quality)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    ['conversion_completed', inputFormat, outputFormat, inputSize, outputSize, savingsPercent, durationMs, quality],
  );
}
