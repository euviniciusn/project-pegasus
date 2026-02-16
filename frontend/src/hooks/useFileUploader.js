import { useState, useCallback, useRef, useMemo } from 'react';
import { uploadFileWithProgress } from '../services/api.js';
import { UPLOAD_STATUS, MAX_CONCURRENT_UPLOADS } from '../constants/index.js';

const SPEED_WINDOW_MS = 3000;

function createInitialState(fileName) {
  return { status: UPLOAD_STATUS.PENDING, progress: 0, speed: 0, error: null };
}

export default function useFileUploader() {
  const [fileUploads, setFileUploads] = useState({});
  const urlMapRef = useRef({});
  const fileMapRef = useRef({});
  const abortRef = useRef({});
  const samplesRef = useRef({});
  const activeRef = useRef(new Set());
  const queueRef = useRef([]);
  const lastFrameRef = useRef({});

  const updateFile = useCallback((name, patch) => {
    setFileUploads((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  }, []);

  const calculateSpeed = useCallback((name, loaded) => {
    const now = Date.now();
    const samples = samplesRef.current[name] || [];
    samples.push({ loaded, timestamp: now });

    const cutoff = now - SPEED_WINDOW_MS;
    const recent = samples.filter((s) => s.timestamp >= cutoff);
    samplesRef.current[name] = recent;

    if (recent.length < 2) return 0;
    const oldest = recent[0];
    const elapsed = (now - oldest.timestamp) / 1000;
    return elapsed > 0 ? (loaded - oldest.loaded) / elapsed : 0;
  }, []);

  const uploadSingleFile = useCallback((name) => {
    const url = urlMapRef.current[name];
    const file = fileMapRef.current[name];
    if (!url || !file) return;

    const controller = new AbortController();
    abortRef.current[name] = controller;
    samplesRef.current[name] = [];
    lastFrameRef.current[name] = 0;

    updateFile(name, { status: UPLOAD_STATUS.UPLOADING, progress: 0, speed: 0, error: null });

    uploadFileWithProgress(url, file, {
      onProgress: ({ loaded, total }) => {
        const now = Date.now();
        if (now - (lastFrameRef.current[name] || 0) < 100) return;
        lastFrameRef.current[name] = now;

        const progress = Math.round((loaded / total) * 100);
        const speed = calculateSpeed(name, loaded);
        updateFile(name, { progress, speed });
      },
      signal: controller.signal,
    })
      .then(() => {
        updateFile(name, { status: UPLOAD_STATUS.COMPLETED, progress: 100, speed: 0 });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        updateFile(name, { status: UPLOAD_STATUS.FAILED, error: err.message, speed: 0 });
      })
      .finally(() => {
        activeRef.current.delete(name);
        delete abortRef.current[name];
        processQueue();
      });
  }, [updateFile, calculateSpeed]);

  const processQueue = useCallback(() => {
    while (activeRef.current.size < MAX_CONCURRENT_UPLOADS && queueRef.current.length > 0) {
      const name = queueRef.current.shift();
      activeRef.current.add(name);
      uploadSingleFile(name);
    }
  }, [uploadSingleFile]);

  const startAllUploads = useCallback((uploadUrls, localFiles) => {
    const fileMap = new Map(localFiles.map((f) => [f.name, f]));
    const initial = {};
    const urls = {};
    const files = {};

    for (const { url, key } of uploadUrls) {
      const name = key.split('/').pop();
      urls[name] = url;
      files[name] = fileMap.get(name);
      initial[name] = createInitialState(name);
    }

    urlMapRef.current = urls;
    fileMapRef.current = files;
    abortRef.current = {};
    samplesRef.current = {};
    activeRef.current = new Set();
    queueRef.current = Object.keys(initial);

    setFileUploads(initial);

    setTimeout(processQueue, 0);
  }, [processQueue]);

  const retryUpload = useCallback((name) => {
    updateFile(name, { status: UPLOAD_STATUS.PENDING, progress: 0, error: null, speed: 0 });
    queueRef.current.push(name);
    processQueue();
  }, [updateFile, processQueue]);

  const cancelUpload = useCallback((name) => {
    abortRef.current[name]?.abort();
    activeRef.current.delete(name);
    delete abortRef.current[name];
    updateFile(name, { status: UPLOAD_STATUS.CANCELLED, speed: 0 });
    processQueue();
  }, [updateFile, processQueue]);

  const resetUploads = useCallback(() => {
    Object.values(abortRef.current).forEach((c) => c.abort());
    abortRef.current = {};
    activeRef.current = new Set();
    queueRef.current = [];
    samplesRef.current = {};
    setFileUploads({});
  }, []);

  const isUploading = useMemo(() => {
    return Object.values(fileUploads).some(
      (f) => f.status === UPLOAD_STATUS.UPLOADING || f.status === UPLOAD_STATUS.PENDING,
    );
  }, [fileUploads]);

  const allCompleted = useMemo(() => {
    const entries = Object.values(fileUploads);
    if (entries.length === 0) return false;
    return entries.every(
      (f) => f.status === UPLOAD_STATUS.COMPLETED || f.status === UPLOAD_STATUS.FAILED || f.status === UPLOAD_STATUS.CANCELLED,
    );
  }, [fileUploads]);

  const hasFailures = useMemo(() => {
    return Object.values(fileUploads).some(
      (f) => f.status === UPLOAD_STATUS.FAILED || f.status === UPLOAD_STATUS.CANCELLED,
    );
  }, [fileUploads]);

  return {
    fileUploads,
    isUploading,
    allCompleted,
    hasFailures,
    startAllUploads,
    retryUpload,
    cancelUpload,
    resetUploads,
  };
}
