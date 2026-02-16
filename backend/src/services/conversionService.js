import sharp from 'sharp';
import { ConversionError } from '../errors/index.js';

const MIME_MAP = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', avif: 'image/avif' };
const DEFAULT_BACKGROUND = '#FFFFFF';
const DEFAULT_QUALITY = 82;
const DEFAULT_AVIF_SPEED = 5;

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

function buildResizeOptions({ resizeWidth, resizeHeight, resizePercent, originalWidth, originalHeight }) {
  if (resizePercent) {
    return {
      width: Math.round(originalWidth * resizePercent / 100),
      height: Math.round(originalHeight * resizePercent / 100),
      fit: 'inside',
      withoutEnlargement: true,
    };
  }

  if (resizeWidth || resizeHeight) {
    return {
      width: resizeWidth || undefined,
      height: resizeHeight || undefined,
      fit: 'inside',
      withoutEnlargement: true,
    };
  }

  return null;
}

function buildPipeline(inputBuffer, { outputFormat, quality, lossless, stripMetadata, background, isAlpha, avifSpeed, resizeOpts }) {
  let pipeline = sharp(inputBuffer);
  const warnings = [];

  if (resizeOpts) {
    pipeline = pipeline.resize(resizeOpts);
  }

  if ((outputFormat === 'jpg' || outputFormat === 'avif') && isAlpha) {
    pipeline = pipeline.flatten({ background: parseHexBackground(background) });
    warnings.push('alphaDropped');
  }

  if (stripMetadata) {
    pipeline = pipeline.withMetadata(false);
  }

  pipeline = applyOutputFormat(pipeline, { outputFormat, quality, lossless, avifSpeed });
  return { pipeline, warnings };
}

function applyOutputFormat(pipeline, { outputFormat, quality, lossless, avifSpeed }) {
  if (outputFormat === 'webp') {
    return pipeline.webp({ quality, lossless: lossless === true });
  }
  if (outputFormat === 'jpg') {
    return pipeline.jpeg({ quality, mozjpeg: true });
  }
  if (outputFormat === 'avif') {
    return pipeline.avif({ quality, speed: avifSpeed ?? DEFAULT_AVIF_SPEED });
  }
  return pipeline.png({ quality });
}

export async function convertImage(inputBuffer, {
  outputFormat,
  quality = DEFAULT_QUALITY,
  lossless = false,
  stripMetadata = true,
  background = DEFAULT_BACKGROUND,
  avifSpeed,
  resizeWidth,
  resizeHeight,
  resizePercent,
}) {
  const meta = await readInputMetadata(inputBuffer);
  const isAlpha = hasAlphaChannel(meta);

  const resizeOpts = buildResizeOptions({
    resizeWidth, resizeHeight, resizePercent,
    originalWidth: meta.width, originalHeight: meta.height,
  });

  const { pipeline, warnings } = buildPipeline(inputBuffer, {
    outputFormat, quality, lossless, stripMetadata, background, isAlpha, avifSpeed, resizeOpts,
  });

  const { data: outputBuffer, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: outputBuffer,
    metadata: {
      inputSize: inputBuffer.length,
      outputSize: info.size,
      width: info.width,
      height: info.height,
      mime: MIME_MAP[outputFormat],
      warnings,
    },
  };
}
