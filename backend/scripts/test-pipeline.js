import '../src/config/index.js';
import crypto from 'node:crypto';
import sharp from 'sharp';
import pool from '../src/db/connection.js';
import { uploadFile, getPresignedDownloadUrl, deleteFiles } from '../src/storage/objectStorage.js';
import * as jobRepo from '../src/repositories/jobRepository.js';
import * as jobFileRepo from '../src/repositories/jobFileRepository.js';
import { addConversionJob, conversionQueue } from '../src/queue/conversionQueue.js';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 1000;

async function createTestPng() {
  return sharp({
    create: { width: 200, height: 200, channels: 4, background: { r: 0, g: 100, b: 255, alpha: 0.8 } },
  }).png().toBuffer();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollFileStatus(fileId) {
  for (let i = 1; i <= MAX_POLL_ATTEMPTS; i++) {
    const file = await jobFileRepo.findById(fileId);
    const terminal = file.status === 'completed' || file.status === 'failed';

    process.stdout.write(`\r  ${DIM}Polling ${i}/${MAX_POLL_ATTEMPTS} — status: ${file.status}${RESET}`);
    if (terminal) {
      process.stdout.write('\n');
      return file;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error('Timeout waiting for file processing');
}

async function run() {
  const uuid = crypto.randomUUID();
  const inputKey = `inputs/${uuid}/test-image.png`;
  const keysToCleanup = [inputKey];

  console.log(`\n${BOLD}=== Full Pipeline Test ===${RESET}\n`);

  // 1. Create test image
  const buffer = await createTestPng();
  console.log(`${BOLD}1. Test image${RESET}: 200x200 blue RGBA PNG (${buffer.length} bytes)`);

  // 2. Upload to MinIO
  await uploadFile(inputKey, buffer, 'image/png');
  console.log(`${BOLD}2. Uploaded${RESET}: ${inputKey}`);

  // 3. Create job in Postgres
  const job = await jobRepo.createJob({
    sessionToken: 'test-session',
    outputFormat: 'webp',
    quality: 80,
    fileCount: 1,
  });
  console.log(`${BOLD}3. Job created${RESET}: ${job.id}`);

  // 4. Create job_file
  const jobFile = await jobFileRepo.createJobFile({
    jobId: job.id,
    originalName: 'test-image.png',
    originalKey: inputKey,
    originalSize: buffer.length,
    originalFormat: 'png',
  });
  console.log(`${BOLD}4. File record${RESET}: ${jobFile.id}`);

  // 5. Enqueue conversion
  await addConversionJob({
    jobId: job.id,
    fileId: jobFile.id,
    inputKey,
    outputFormat: 'webp',
    options: { quality: 80 },
  });
  console.log(`${BOLD}5. Enqueued${RESET}: convert-${jobFile.id}`);

  // 6. Poll for completion
  console.log(`${BOLD}6. Waiting for worker...${RESET}`);
  const result = await pollFileStatus(jobFile.id);

  if (result.status === 'failed') {
    console.log(`\n  ${RED}File failed:${RESET} ${result.error_message}`);
    await cleanup(keysToCleanup, job.id);
    process.exit(1);
  }

  // 7. Print results
  keysToCleanup.push(result.converted_key);
  const updatedJob = await jobRepo.findById(job.id);

  console.log(`\n${BOLD}7. Results${RESET}`);
  console.log(`  Status:      ${GREEN}${result.status}${RESET}`);
  console.log(`  Input:       ${buffer.length} bytes`);
  console.log(`  Output:      ${result.converted_size} bytes`);
  console.log(`  Savings:     ${result.savings_percent}%`);
  console.log(`  Output key:  ${result.converted_key}`);
  console.log(`  Warnings:    ${result.warnings?.length ? result.warnings.join(', ') : 'none'}`);
  console.log(`  Job status:  ${updatedJob.status}`);

  // 8. Presigned URL
  const downloadUrl = await getPresignedDownloadUrl(result.converted_key);
  console.log(`\n${BOLD}8. Download URL${RESET}`);
  console.log(`  ${downloadUrl}`);

  console.log(`\n${GREEN}Pipeline test passed.${RESET}\n`);

  await cleanup(keysToCleanup, job.id);
}

async function cleanup(keys, jobId) {
  console.log(`${DIM}Cleaning up...${RESET}`);
  try { await deleteFiles(keys); } catch { /* best effort */ }
  try { await pool.query('DELETE FROM jobs WHERE id = $1', [jobId]); } catch { /* best effort */ }
  await conversionQueue.close();
  await pool.end();
}

run().catch(async (err) => {
  console.error(`\n${RED}Pipeline test failed:${RESET}`, err.message);
  console.error('\nMake sure all services are running:');
  console.error('  docker compose up -d postgres redis minio');
  console.error('  docker compose run --rm migrate');
  console.error('  docker compose run --rm minio-init');
  console.error('  npm run worker  (in another terminal)');
  await conversionQueue.close().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
