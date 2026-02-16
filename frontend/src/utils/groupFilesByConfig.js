import { MIME_TO_FORMAT, DEFAULT_QUALITY } from '../constants/index.js';

function getResizeKey(config) {
  const { resizePreset, customWidth, customHeight } = config;
  if (!resizePreset || resizePreset === 'original') return 'none';
  if (resizePreset === 'custom') return `c:${customWidth || 0}x${customHeight || 0}`;
  return `p:${resizePreset}`;
}

function resolveOutputFormat(file, config, mode) {
  if (mode === 'convert') return config.outputFormat;
  return MIME_TO_FORMAT[file.type] || 'jpg';
}

function resolveResizeOptions(config) {
  const { resizePreset, customWidth, customHeight } = config;
  if (!resizePreset || resizePreset === 'original') return {};

  const pct = parseInt(resizePreset, 10);
  if (resizePreset === '50' || resizePreset === '25') {
    return { resizePercent: pct };
  }
  if (pct >= 100) {
    return { customWidth: pct, customHeight: null };
  }
  if (resizePreset === 'custom') {
    return { customWidth, customHeight };
  }
  return {};
}

export default function groupFilesByConfig(files, applyToAll, globalConfig, fileConfigs, mode) {
  const groups = {};

  files.forEach((file, index) => {
    const config = applyToAll
      ? { outputFormat: globalConfig.outputFormat, quality: globalConfig.quality, resizePreset: globalConfig.resizePreset, customWidth: globalConfig.customWidth, customHeight: globalConfig.customHeight }
      : fileConfigs[index] || { outputFormat: 'webp', quality: DEFAULT_QUALITY, resizePreset: 'original' };

    const outputFormat = resolveOutputFormat(file, config, mode);
    const quality = config.quality || DEFAULT_QUALITY;
    const resizeKey = getResizeKey(config);
    const groupKey = `${outputFormat}:${quality}:${resizeKey}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        localFiles: [],
        outputFormat,
        quality,
        resizeOptions: resolveResizeOptions(config),
      };
    }

    groups[groupKey].localFiles.push(file);
  });

  return Object.values(groups);
}
