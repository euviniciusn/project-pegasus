import { useState, useCallback, useRef } from 'react';
import {
  createJob,
  startJob as apiStartJob,
  getJobStatus,
} from '../services/api.js';
import { JOB_STATUS, POLLING_INTERVAL } from '../constants/index.js';
import usePolling from './usePolling.js';

function isTerminalStatus(status) {
  return status === JOB_STATUS.COMPLETED || status === JOB_STATUS.FAILED;
}

function buildApiPayload(localFiles, outputFormat, quality, resizeOptions) {
  const files = localFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));
  const payload = { files, outputFormat, quality };
  const { resizePreset, customWidth, customHeight } = resizeOptions;

  if (resizePreset === '50' || resizePreset === '25') {
    payload.resizePercent = parseInt(resizePreset, 10);
  } else if (resizePreset === 'custom') {
    if (customWidth) payload.width = customWidth;
    if (customHeight) payload.height = customHeight;
  }

  return payload;
}

export default function useJob() {
  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const jobIdRef = useRef(null);
  const [isPolling, setIsPolling] = useState(false);
  const [previews, setPreviews] = useState({});

  const pollStatus = useCallback(async () => {
    if (!jobIdRef.current) return;
    try {
      const data = await getJobStatus(jobIdRef.current);
      setJob(data.job);
      setFiles(data.files);

      if (isTerminalStatus(data.job.status)) {
        setIsPolling(false);
        setIsProcessing(false);
        setIsCompleted(true);
      }
    } catch (err) {
      setError(err.message);
      setIsPolling(false);
      setIsProcessing(false);
    }
  }, []);

  usePolling(pollStatus, POLLING_INTERVAL, isPolling);

  const createAndPrepare = useCallback(async (localFiles, outputFormat, quality, resizeOptions = {}) => {
    setError(null);
    setIsProcessing(true);
    setIsCompleted(false);
    setJob(null);
    setFiles([]);

    const previewMap = {};
    for (const f of localFiles) {
      previewMap[f.name] = URL.createObjectURL(f);
    }
    setPreviews(previewMap);

    const payload = buildApiPayload(localFiles, outputFormat, quality, resizeOptions);
    const { jobId, uploadUrls } = await createJob(payload);
    jobIdRef.current = jobId;

    return { jobId, uploadUrls };
  }, []);

  const confirmAndStart = useCallback(async (excludeFileIds) => {
    try {
      await apiStartJob(jobIdRef.current, excludeFileIds);
      setIsPolling(true);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsPolling(false);
    jobIdRef.current = null;
    setJob(null);
    setFiles([]);
    setIsProcessing(false);
    setIsCompleted(false);
    setError(null);
    setPreviews((prev) => {
      Object.values(prev).forEach(URL.revokeObjectURL);
      return {};
    });
  }, []);

  return {
    job,
    files,
    previews,
    isProcessing,
    isCompleted,
    error,
    createAndPrepare,
    confirmAndStart,
    reset,
  };
}
