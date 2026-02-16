import { createContext, useContext, useCallback, useMemo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import useUpload from '../hooks/useUpload.js';
import useJob from '../hooks/useJob.js';
import useFileUploader from '../hooks/useFileUploader.js';
import useLimits from '../hooks/useLimits.js';
import { getDownloadUrl as apiGetDownloadUrl } from '../services/api.js';
import { UPLOAD_STATUS } from '../constants/index.js';

const JobContext = createContext(null);

export function JobProvider({ children }) {
  const upload = useUpload();
  const jobHook = useJob();
  const fileUploader = useFileUploader();
  const limitsHook = useLimits();
  const uploadUrlsRef = useRef([]);
  const [isUploadPhase, setIsUploadPhase] = useState(false);

  const startConversion = useCallback(async () => {
    try {
      const { uploadUrls } = await jobHook.createAndPrepare(
        upload.files, upload.outputFormat, upload.quality, {
          resizePreset: upload.resizePreset,
          customWidth: upload.customWidth,
          customHeight: upload.customHeight,
        },
      );
      uploadUrlsRef.current = uploadUrls;
      setIsUploadPhase(true);
      fileUploader.startAllUploads(uploadUrls, upload.files);
      limitsHook.refresh();
    } catch (err) {
      // createAndPrepare already sets error state in useJob
    }
  }, [
    jobHook, fileUploader, limitsHook, upload.files, upload.outputFormat, upload.quality,
    upload.resizePreset, upload.customWidth, upload.customHeight,
  ]);

  useEffect(() => {
    if (!isUploadPhase || !fileUploader.allCompleted) return;
    if (fileUploader.hasFailures) return;

    setIsUploadPhase(false);
    jobHook.confirmAndStart();
  }, [isUploadPhase, fileUploader.allCompleted, fileUploader.hasFailures, jobHook]);

  const confirmWithFailures = useCallback(() => {
    const failedNames = new Set();
    for (const [name, state] of Object.entries(fileUploader.fileUploads)) {
      if (state.status === UPLOAD_STATUS.FAILED || state.status === UPLOAD_STATUS.CANCELLED) {
        failedNames.add(name);
      }
    }

    const excludeFileIds = uploadUrlsRef.current
      .filter(({ key }) => failedNames.has(key.split('/').pop()))
      .map(({ fileId }) => fileId);

    setIsUploadPhase(false);
    jobHook.confirmAndStart(excludeFileIds);
  }, [fileUploader.fileUploads, jobHook]);

  const reset = useCallback(() => {
    upload.clearFiles();
    fileUploader.resetUploads();
    uploadUrlsRef.current = [];
    setIsUploadPhase(false);
    jobHook.reset();
  }, [upload, fileUploader, jobHook]);

  const getDownloadUrl = useCallback((fileId) => {
    if (!jobHook.job) return Promise.reject(new Error('No active job'));
    return apiGetDownloadUrl(jobHook.job.id, fileId);
  }, [jobHook.job]);

  const value = useMemo(() => ({
    files: upload.files,
    outputFormat: upload.outputFormat,
    quality: upload.quality,
    errors: upload.errors,
    resizePreset: upload.resizePreset,
    customWidth: upload.customWidth,
    customHeight: upload.customHeight,
    isAspectRatioLocked: upload.isAspectRatioLocked,
    fileDimensions: upload.fileDimensions,
    fileUploads: fileUploader.fileUploads,
    isUploadPhase,
    isUploadingFiles: fileUploader.isUploading,
    allUploadsCompleted: fileUploader.allCompleted,
    hasUploadFailures: fileUploader.hasFailures,
    job: jobHook.job,
    jobFiles: jobHook.files,
    previews: jobHook.previews,
    isProcessing: jobHook.isProcessing,
    isCompleted: jobHook.isCompleted,
    error: jobHook.error,
    limits: limitsHook.limits,
    remaining: limitsHook.remaining,
    addFiles: upload.addFiles,
    removeFile: upload.removeFile,
    setOutputFormat: upload.setOutputFormat,
    setQuality: upload.setQuality,
    setResizePreset: upload.setResizePreset,
    setCustomWidth: upload.setCustomWidth,
    setCustomHeight: upload.setCustomHeight,
    setIsAspectRatioLocked: upload.setIsAspectRatioLocked,
    startConversion,
    confirmWithFailures,
    retryUpload: fileUploader.retryUpload,
    cancelUpload: fileUploader.cancelUpload,
    reset,
    getDownloadUrl,
  }), [
    upload.files, upload.outputFormat, upload.quality, upload.errors,
    upload.resizePreset, upload.customWidth, upload.customHeight,
    upload.isAspectRatioLocked, upload.fileDimensions,
    upload.addFiles, upload.removeFile, upload.setOutputFormat, upload.setQuality,
    upload.setResizePreset, upload.setCustomWidth, upload.setCustomHeight,
    upload.setIsAspectRatioLocked,
    fileUploader.fileUploads, isUploadPhase, fileUploader.isUploading,
    fileUploader.allCompleted, fileUploader.hasFailures,
    fileUploader.retryUpload, fileUploader.cancelUpload,
    jobHook.job, jobHook.files, jobHook.previews, jobHook.isProcessing,
    jobHook.isCompleted, jobHook.error, limitsHook.limits, limitsHook.remaining,
    startConversion, confirmWithFailures, reset, getDownloadUrl,
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
