import sharp from 'sharp';
import { convertImage } from '../src/services/conversionService.js';
import { ConversionError } from '../src/errors/index.js';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function printResult(label, { metadata }) {
  const savings = (1 - metadata.outputSize / metadata.inputSize) * 100;
  const sign = savings >= 0 ? '-' : '+';

  console.log(`  ${BOLD}${label}${RESET}`);
  console.log(`    ${metadata.width}x${metadata.height} | ${metadata.mime}`);
  console.log(`    ${metadata.inputSize} → ${metadata.outputSize} bytes (${sign}${Math.abs(savings).toFixed(1)}%)`);
  if (metadata.warnings.length > 0) {
    console.log(`    warnings: ${metadata.warnings.join(', ')}`);
  }
  console.log();
}

async function createTestImage() {
  return sharp({
    create: { width: 100, height: 100, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } },
  }).png().toBuffer();
}

async function run() {
  const inputBuffer = await createTestImage();
  console.log(`\n${BOLD}Test image:${RESET} 100x100 RGBA PNG (${inputBuffer.length} bytes)\n`);

  const webpResult = await convertImage(inputBuffer, { outputFormat: 'webp', quality: 80 });
  printResult('PNG → WebP (quality 80)', webpResult);

  const jpgResult = await convertImage(inputBuffer, { outputFormat: 'jpg', quality: 80 });
  printResult('PNG → JPG (quality 80, alpha → flatten)', jpgResult);

  const pngResult = await convertImage(inputBuffer, { outputFormat: 'png' });
  printResult('PNG → PNG (re-encode)', pngResult);

  try {
    await convertImage(Buffer.from('not-an-image'), { outputFormat: 'webp' });
    console.log(`  ${RED}FAIL${RESET} Invalid buffer did not throw\n`);
    process.exit(1);
  } catch (err) {
    const isCorrectError = err instanceof ConversionError;
    const icon = isCorrectError ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    console.log(`  ${icon} Invalid buffer → ${err.constructor.name} (${err.statusCode}): ${err.message}\n`);
    if (!isCorrectError) process.exit(1);
  }

  console.log(`${GREEN}All tests passed.${RESET}\n`);
}

run().catch((err) => {
  console.error(`${RED}Unexpected error:${RESET}`, err);
  process.exit(1);
});
