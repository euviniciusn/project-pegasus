import { useState, useCallback, useRef } from 'react';
import {
  createJob,
  uploadFileToPresigned,
  startJob as apiStartJob,
  getJobStatus,
} from '../services/api.js';
import { JOB_STATUS, POLLING_INTERVAL } from '../constants/index.js';
import usePolling from './usePolling.js';

function isTerminalStatus(status) {
  return status === JOB_STATUS.COMPLETED || status === JOB_STATUS.FAILED;
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

  const uploadFiles = useCallback(async (uploadUrls, localFiles) => {
    const fileMap = new Map(localFiles.map((f) => [f.name, f]));

    await Promise.all(
      uploadUrls.map(({ url, key }) => {
        const fileName = key.split('/').pop();
        const file = fileMap.get(fileName);
        return uploadFileToPresigned(url, file);
      }),
    );
  }, []);

  const startConversion = useCallback(async (localFiles, outputFormat, quality) => {
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

    try {
      const fileMeta = localFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));

      const { jobId, uploadUrls } = await createJob({
        files: fileMeta,
        outputFormat,
        quality,
      });

      jobIdRef.current = jobId;
      await uploadFiles(uploadUrls, localFiles);
      await apiStartJob(jobId);
      setIsPolling(true);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  }, [uploadFiles]);

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
    startConversion,
    reset,
  };
}
