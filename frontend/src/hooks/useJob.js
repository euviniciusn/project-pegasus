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
  const { resizePreset, customWidth, customHeight, resizePercent } = resizeOptions;

  if (resizePercent) {
    payload.resizePercent = resizePercent;
  } else if (resizePreset === '50' || resizePreset === '25') {
    payload.resizePercent = parseInt(resizePreset, 10);
  } else if (resizePreset === 'custom' || customWidth) {
    if (customWidth) payload.width = customWidth;
    if (customHeight) payload.height = customHeight;
  } else if (resizePreset) {
    const px = parseInt(resizePreset, 10);
    if (px >= 100) payload.width = px;
  }

  return payload;
}

export default function useJob() {
  const [jobs, setJobs] = useState([]);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const jobIdsRef = useRef([]);
  const [isPolling, setIsPolling] = useState(false);
  const [previews, setPreviews] = useState({});

  const pollStatus = useCallback(async () => {
    if (jobIdsRef.current.length === 0) return;
    try {
      const results = await Promise.all(
        jobIdsRef.current.map((id) => getJobStatus(id)),
      );

      const mergedJobs = results.map((r) => r.job);
      const mergedFiles = results.flatMap((r) => r.files);
      setJobs(mergedJobs);
      setFiles(mergedFiles);

      const allTerminal = mergedJobs.every((j) => isTerminalStatus(j.status));
      if (allTerminal) {
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

  const createAndPrepare = useCallback(async (groups) => {
    setError(null);
    setIsProcessing(true);
    setIsCompleted(false);
    setJobs([]);
    setFiles([]);

    const previewMap = {};
    for (const group of groups) {
      for (const f of group.localFiles) {
        if (!previewMap[f.name]) {
          previewMap[f.name] = URL.createObjectURL(f);
        }
      }
    }
    setPreviews(previewMap);

    const allResults = [];
    for (const group of groups) {
      const payload = buildApiPayload(
        group.localFiles, group.outputFormat, group.quality, group.resizeOptions,
      );
      const result = await createJob(payload);
      allResults.push({ ...result, localFiles: group.localFiles });
    }

    jobIdsRef.current = allResults.map((r) => r.jobId);
    return allResults;
  }, []);

  const confirmAndStart = useCallback(async (excludeFileIds) => {
    try {
      for (const jobId of jobIdsRef.current) {
        await apiStartJob(jobId, excludeFileIds);
      }
      setIsPolling(true);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsPolling(false);
    jobIdsRef.current = [];
    setJobs([]);
    setFiles([]);
    setIsProcessing(false);
    setIsCompleted(false);
    setError(null);
    setPreviews((prev) => {
      Object.values(prev).forEach(URL.revokeObjectURL);
      return {};
    });
  }, []);

  // Backward-compatible: expose first job as `job`
  const job = jobs.length > 0 ? jobs[0] : null;

  return {
    job,
    jobs,
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
