import { useState, useCallback } from 'react';
import {
  ACCEPTED_INPUT_FORMATS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_JOB,
  DEFAULT_QUALITY,
} from '../constants/index.js';
import readImageDimensions from '../utils/readImageDimensions.js';

function validateFile(file) {
  if (!ACCEPTED_INPUT_FORMATS.includes(file.type)) {
    return `"${file.name}": formato não aceito (use PNG ou JPEG)`;
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return `"${file.name}": excede 20MB (${sizeMB}MB)`;
  }
  return null;
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
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
    setResizePreset('original');
    setCustomWidth(null);
    setCustomHeight(null);
    setIsAspectRatioLocked(true);
    setFileDimensions({});
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
    addFiles,
    removeFile,
    setOutputFormat,
    setQuality,
    setResizePreset,
    setCustomWidth,
    setCustomHeight,
    setIsAspectRatioLocked,
    clearFiles,
  };
}
