import sharp from 'sharp';
import { ConversionError } from '../errors/index.js';

const MIME_MAP = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png' };
const DEFAULT_BACKGROUND = '#FFFFFF';
const DEFAULT_QUALITY = 82;

async function readInputMetadata(inputBuffer) {
  try {
    return await sharp(inputBuffer).metadata();
  } catch (err) {
    throw new ConversionError(`Invalid image buffer: ${err.message}`);
  }
}

function hasAlphaChannel(meta) {
  return meta.hasAlpha === true;
}

function parseHexBackground(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function buildPipeline(inputBuffer, { outputFormat, quality, lossless, stripMetadata, background, isAlpha }) {
  let pipeline = sharp(inputBuffer);
  const warnings = [];

  if (outputFormat === 'jpg' && isAlpha) {
    pipeline = pipeline.flatten({ background: parseHexBackground(background) });
    warnings.push('alphaDropped');
  }

  if (stripMetadata) {
    pipeline = pipeline.withMetadata(false);
  }

  pipeline = applyOutputFormat(pipeline, { outputFormat, quality, lossless });
  return { pipeline, warnings };
}

function applyOutputFormat(pipeline, { outputFormat, quality, lossless }) {
  if (outputFormat === 'webp') {
    return pipeline.webp({ quality, lossless: lossless === true });
  }
  if (outputFormat === 'jpg') {
    return pipeline.jpeg({ quality, mozjpeg: true });
  }
  return pipeline.png({ quality });
}

export async function convertImage(inputBuffer, {
  outputFormat,
  quality = DEFAULT_QUALITY,
  lossless = false,
  stripMetadata = true,
  background = DEFAULT_BACKGROUND,
}) {
  const meta = await readInputMetadata(inputBuffer);
  const isAlpha = hasAlphaChannel(meta);

  const { pipeline, warnings } = buildPipeline(inputBuffer, {
    outputFormat, quality, lossless, stripMetadata, background, isAlpha,
  });

  const outputBuffer = await pipeline.toBuffer();

  return {
    buffer: outputBuffer,
    metadata: {
      inputSize: inputBuffer.length,
      outputSize: outputBuffer.length,
      width: meta.width,
      height: meta.height,
      mime: MIME_MAP[outputFormat],
      warnings,
    },
  };
}
