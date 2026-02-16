import { useState, useCallback } from 'react';
import {
  ACCEPTED_INPUT_FORMATS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_JOB,
  DEFAULT_QUALITY,
  MIME_TO_FORMAT,
} from '../constants/index.js';
import readImageDimensions from '../utils/readImageDimensions.js';

function validateFile(file) {
  if (!ACCEPTED_INPUT_FORMATS.includes(file.type)) {
    return `"${file.name}": formato não aceito (use PNG ou JPEG)`;
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return `"${file.name}": excede 10MB (${sizeMB}MB)`;
  }
  return null;
}

function buildDefaultFileConfig(file, mode, globalConfig) {
  const inputFormat = MIME_TO_FORMAT[file.type] || 'jpg';
  return {
    outputFormat: mode === 'convert' ? globalConfig.outputFormat : inputFormat,
    quality: globalConfig.quality,
    resizePreset: mode === 'resize' ? globalConfig.resizePreset : 'original',
    customWidth: globalConfig.customWidth,
    customHeight: globalConfig.customHeight,
  };
}

export default function useUpload() {
  const [files, setFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('webp');
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [errors, setErrors] = useState([]);
  const [resizePreset, setResizePreset] = useState('original');
  const [customWidth, setCustomWidth] = useState(null);
  const [customHeight, setCustomHeight] = useState(null);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  const [fileDimensions, setFileDimensions] = useState({});
  const [applyToAll, setApplyToAllRaw] = useState(true);
  const [fileConfigs, setFileConfigs] = useState({});

  const addFiles = useCallback((fileList) => {
    const newErrors = [];
    const validFiles = [];

    for (const file of Array.from(fileList)) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        continue;
      }
      validFiles.push(file);
    }

    setFiles((prev) => {
      const total = prev.length + validFiles.length;
      if (total > MAX_FILES_PER_JOB) {
        newErrors.push(`Máximo ${MAX_FILES_PER_JOB} arquivos por vez`);
        return prev;
      }
      return [...prev, ...validFiles];
    });

    for (const file of validFiles) {
      readImageDimensions(file).then((dims) => {
        if (!dims) return;
        setFileDimensions((prev) => ({ ...prev, [file.name]: dims }));
      });
    }

    setErrors(newErrors);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileConfigs((prev) => {
      const next = {};
      for (const [key, val] of Object.entries(prev)) {
        const k = Number(key);
        if (k < index) next[k] = val;
        else if (k > index) next[k - 1] = val;
      }
      return next;
    });
  }, []);

  const setApplyToAll = useCallback((val, mode) => {
    setApplyToAllRaw(val);
    if (!val) {
      setFiles((currentFiles) => {
        setFileConfigs(() => {
          const configs = {};
          const global = { outputFormat, quality, resizePreset, customWidth, customHeight };
          currentFiles.forEach((file, i) => {
            configs[i] = buildDefaultFileConfig(file, mode, global);
          });
          return configs;
        });
        return currentFiles;
      });
    }
  }, [outputFormat, quality, resizePreset, customWidth, customHeight]);

  const setFileConfig = useCallback((index, partial) => {
    setFileConfigs((prev) => ({
      ...prev,
      [index]: { ...prev[index], ...partial },
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
    setResizePreset('original');
    setCustomWidth(null);
    setCustomHeight(null);
    setIsAspectRatioLocked(true);
    setFileDimensions({});
    setApplyToAllRaw(true);
    setFileConfigs({});
  }, []);

  return {
    files,
    outputFormat,
    quality,
    errors,
    resizePreset,
    customWidth,
    customHeight,
    isAspectRatioLocked,
    fileDimensions,
    applyToAll,
    fileConfigs,
    addFiles,
    removeFile,
    setOutputFormat,
    setQuality,
    setResizePreset,
    setCustomWidth,
    setCustomHeight,
    setIsAspectRatioLocked,
    setApplyToAll,
    setFileConfig,
    clearFiles,
  };
}
