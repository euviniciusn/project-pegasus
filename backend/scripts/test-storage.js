import '../src/config/index.js';
import sharp from 'sharp';
import {
  uploadFile,
  downloadFile,
  deleteFile,
  fileExists,
  getPresignedDownloadUrl,
} from '../src/storage/objectStorage.js';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

const TEST_KEY = 'test/test-image.png';

function assert(condition, label) {
  const icon = condition ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
  console.log(`  ${icon} ${label}`);
  if (!condition) process.exit(1);
}

async function createTestPng() {
  return sharp({
    create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
  }).png().toBuffer();
}

async function run() {
  const buffer = await createTestPng();
  console.log(`\n${BOLD}Test PNG:${RESET} 100x100 red (${buffer.length} bytes)\n`);

  console.log(`${BOLD}1. Upload${RESET}`);
  await uploadFile(TEST_KEY, buffer, 'image/png');
  assert(true, `Uploaded "${TEST_KEY}"`);

  console.log(`\n${BOLD}2. File exists${RESET}`);
  const exists = await fileExists(TEST_KEY);
  assert(exists === true, `fileExists("${TEST_KEY}") → true`);

  console.log(`\n${BOLD}3. Presigned download URL${RESET}`);
  const url = await getPresignedDownloadUrl(TEST_KEY);
  assert(typeof url === 'string' && url.includes(TEST_KEY), 'URL generated');
  console.log(`    ${url}\n`);

  console.log(`${BOLD}4. Download & compare${RESET}`);
  const downloaded = await downloadFile(TEST_KEY);
  assert(Buffer.isBuffer(downloaded), 'Received buffer');
  assert(downloaded.length === buffer.length, `Size matches: ${downloaded.length} === ${buffer.length}`);

  console.log(`\n${BOLD}5. Delete${RESET}`);
  await deleteFile(TEST_KEY);
  assert(true, `Deleted "${TEST_KEY}"`);

  console.log(`\n${BOLD}6. Confirm deleted${RESET}`);
  const gone = await fileExists(TEST_KEY);
  assert(gone === false, `fileExists("${TEST_KEY}") → false`);

  console.log(`\n${GREEN}All storage tests passed.${RESET}\n`);
}

run().catch((err) => {
  console.error(`\n${RED}Test failed:${RESET}`, err.message);
  console.error('Make sure MinIO is running: docker compose up -d minio && docker compose run --rm minio-init');
  process.exit(1);
});
