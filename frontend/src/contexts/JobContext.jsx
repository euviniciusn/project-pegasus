import { createContext, useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import useUpload from '../hooks/useUpload.js';
import useJob from '../hooks/useJob.js';
import { getDownloadUrl as apiGetDownloadUrl } from '../services/api.js';

const JobContext = createContext(null);

export function JobProvider({ children }) {
  const upload = useUpload();
  const jobHook = useJob();

  const startConversion = useCallback(async () => {
    await jobHook.startConversion(upload.files, upload.outputFormat, upload.quality);
  }, [jobHook, upload.files, upload.outputFormat, upload.quality]);

  const reset = useCallback(() => {
    upload.clearFiles();
    jobHook.reset();
  }, [upload, jobHook]);

  const getDownloadUrl = useCallback((fileId) => {
    if (!jobHook.job) return Promise.reject(new Error('No active job'));
    return apiGetDownloadUrl(jobHook.job.id, fileId);
  }, [jobHook.job]);

  const value = useMemo(() => ({
    files: upload.files,
    outputFormat: upload.outputFormat,
    quality: upload.quality,
    isUploading: upload.isUploading,
    uploadProgress: upload.uploadProgress,
    errors: upload.errors,
    job: jobHook.job,
    jobFiles: jobHook.files,
    isProcessing: jobHook.isProcessing,
    isCompleted: jobHook.isCompleted,
    error: jobHook.error,
    addFiles: upload.addFiles,
    removeFile: upload.removeFile,
    setOutputFormat: upload.setOutputFormat,
    setQuality: upload.setQuality,
    startConversion,
    reset,
    getDownloadUrl,
  }), [
    upload.files, upload.outputFormat, upload.quality,
    upload.isUploading, upload.uploadProgress, upload.errors,
    upload.addFiles, upload.removeFile, upload.setOutputFormat, upload.setQuality,
    jobHook.job, jobHook.files, jobHook.isProcessing,
    jobHook.isCompleted, jobHook.error,
    startConversion, reset, getDownloadUrl,
  ]);

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

JobProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useJobContext() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
}
