import sharp from 'sharp';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 1000;

let sessionCookie = '';

async function createTestPng() {
  return sharp({
    create: { width: 200, height: 200, channels: 4, background: { r: 0, g: 100, b: 255, alpha: 0.8 } },
  }).png().toBuffer();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractCookie(response) {
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) sessionCookie = setCookie.split(';')[0];
}

async function api(method, path, body) {
  const headers = { Cookie: sessionCookie };
  const opts = { method, headers };

  if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, opts);
  extractCookie(response);

  const data = await response.json();
  if (!data.success) throw new Error(`API error: ${data.error?.message || response.status}`);
  return data.data;
}

async function createJob() {
  return api('POST', '/api/jobs', {
    files: [{ name: 'test-image.png', size: 5000, type: 'image/png' }],
    outputFormat: 'webp',
    quality: 80,
  });
}

async function uploadToPresignedUrl(url, buffer) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: buffer,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
}

async function pollJobStatus(jobId) {
  for (let i = 1; i <= MAX_POLL_ATTEMPTS; i++) {
    const { job } = await api('GET', `/api/jobs/${jobId}`);
    const terminal = job.status === 'completed' || job.status === 'failed';

    process.stdout.write(`\r  ${DIM}Polling ${i}/${MAX_POLL_ATTEMPTS} — status: ${job.status}${RESET}`);
    if (terminal) {
      process.stdout.write('\n');
      return job;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error('Timeout waiting for job to complete');
}

async function downloadFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function run() {
  console.log(`\n${BOLD}=== API Integration Test ===${RESET}\n`);
  console.log(`${DIM}Base URL: ${BASE_URL}${RESET}\n`);

  // 1. Create job
  const { jobId, uploadUrls } = await createJob();
  const { fileId, url: uploadUrl } = uploadUrls[0];
  console.log(`${BOLD}1. Job created${RESET}: ${jobId}`);
  console.log(`   File ID: ${fileId}`);

  // 2. Upload image via presigned URL
  const buffer = await createTestPng();
  await uploadToPresignedUrl(uploadUrl, buffer);
  console.log(`${BOLD}2. Uploaded${RESET}: ${buffer.length} bytes via presigned URL`);

  // 3. Start processing
  await api('POST', `/api/jobs/${jobId}/start`);
  console.log(`${BOLD}3. Processing started${RESET}`);

  // 4. Poll until done
  console.log(`${BOLD}4. Waiting for completion...${RESET}`);
  const job = await pollJobStatus(jobId);

  if (job.failed_files > 0 && job.completed_files === 0) {
    console.log(`\n  ${RED}All files failed${RESET}`);
    process.exit(1);
  }

  // 5. Get download URL
  const { url: downloadUrl, fileName } = await api('GET', `/api/jobs/${jobId}/download/${fileId}`);
  console.log(`${BOLD}5. Download URL${RESET}: obtained for "${fileName}"`);

  // 6. Download converted file
  const converted = await downloadFromUrl(downloadUrl);
  const savings = ((buffer.length - converted.length) / buffer.length * 100).toFixed(1);
  console.log(`${BOLD}6. Downloaded${RESET}: ${converted.length} bytes`);

  // 7. Results
  console.log(`\n${BOLD}7. Results${RESET}`);
  console.log(`  Job status:      ${GREEN}${job.status}${RESET}`);
  console.log(`  Completed files: ${job.completed_files}`);
  console.log(`  Failed files:    ${job.failed_files}`);
  console.log(`  Input size:      ${buffer.length} bytes`);
  console.log(`  Output size:     ${converted.length} bytes`);
  console.log(`  Savings:         ${savings}%`);

  console.log(`\n${GREEN}API integration test passed.${RESET}\n`);
}

run().catch((err) => {
  console.error(`\n${RED}API test failed:${RESET}`, err.message);
  console.error('\nMake sure all services are running:');
  console.error('  docker compose up -d postgres redis minio');
  console.error('  docker compose run --rm migrate');
  console.error('  docker compose run --rm minio-init');
  console.error('  npm run dev     (API server)');
  console.error('  npm run worker  (conversion worker)');
  process.exit(1);
});
