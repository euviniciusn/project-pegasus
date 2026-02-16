import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FILE_STATUS, UPLOAD_STATUS } from '../constants/index.js';
import formatBytes from '../utils/formatBytes.js';
import UploadProgressBar from './UploadProgressBar.jsx';

function StatusBadge({ status }) {
  const config = {
    [FILE_STATUS.PENDING]: { label: 'Pendente', style: 'text-neutral-400' },
    [FILE_STATUS.PROCESSING]: { label: 'Processando...', style: 'text-primary-600' },
    [FILE_STATUS.COMPLETED]: { label: 'Concluído', style: 'text-green-600' },
    [FILE_STATUS.FAILED]: { label: 'Falhou', style: 'text-red-500' },
  };

  const { label, style } = config[status] || config[FILE_STATUS.PENDING];

  return (
    <span className={`text-xs font-medium ${style} flex items-center gap-1.5`}>
      {status === FILE_STATUS.PROCESSING && (
        <span className="inline-block w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      )}
      {status === FILE_STATUS.COMPLETED && '✓'}
      {status === FILE_STATUS.FAILED && '✕'}
      {label}
    </span>
  );
}

StatusBadge.propTypes = { status: PropTypes.string.isRequired };

function SavingsBadge({ originalSize, convertedSize }) {
  if (!originalSize || !convertedSize) return null;
  const percent = ((originalSize - convertedSize) / originalSize * 100).toFixed(1);
  const isSmaller = convertedSize < originalSize;

  return (
    <span className={`text-xs font-medium ${isSmaller ? 'text-green-600' : 'text-yellow-600'}`}>
      {isSmaller ? `−${percent}%` : `+${Math.abs(percent)}%`}
    </span>
  );
}

SavingsBadge.propTypes = {
  originalSize: PropTypes.number,
  convertedSize: PropTypes.number,
};

export default function FileCard({
  file, localFile, previewUrl, status, convertedSize, onRemove, onDownload,
  uploadStatus, uploadProgress, uploadSpeed, uploadError, onRetry, onCancel,
}) {
  const [localPreview, setLocalPreview] = useState(null);
  const name = file?.original_name || localFile?.name;
  const rawSize = file?.original_size ?? localFile?.size;
  const size = rawSize != null ? Number(rawSize) : undefined;
  const isComplete = status === FILE_STATUS.COMPLETED;
  const isFailed = status === FILE_STATUS.FAILED;
  const isUploadFailed = uploadStatus === UPLOAD_STATUS.FAILED || uploadStatus === UPLOAD_STATUS.CANCELLED;
  const preview = previewUrl || localPreview;

  useEffect(() => {
    if (!localFile) return;
    const url = URL.createObjectURL(localFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onRemove?.();
  }, [onRemove]);

  return (
    <div className={`
      flex items-center gap-3 rounded-2xl p-3
      border transition-all duration-300
      ${isFailed || isUploadFailed
        ? 'border-red-200 bg-red-50'
        : uploadStatus === UPLOAD_STATUS.UPLOADING
          ? 'border-primary-200 bg-primary-50/30 shadow-sm'
          : 'border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-neutral-300'}
    `}>
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
        {preview && <img src={preview} alt={name} loading="lazy" className="w-full h-full object-cover" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700 font-medium truncate">{name}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">{formatBytes(size)}</span>
          {isComplete && <SavingsBadge originalSize={size} convertedSize={convertedSize} />}
          {status && <StatusBadge status={status} />}
          {!status && uploadStatus === UPLOAD_STATUS.PENDING && (
            <span className="text-xs text-neutral-400">Na fila...</span>
          )}
          {!status && uploadStatus === UPLOAD_STATUS.COMPLETED && (
            <span className="text-xs text-green-600 font-medium">✓ Enviado</span>
          )}
          {!status && isUploadFailed && (
            <span className="text-xs text-red-500 font-medium">{uploadError || 'Falha no envio'}</span>
          )}
        </div>
        {uploadStatus === UPLOAD_STATUS.UPLOADING && (
          <UploadProgressBar progress={uploadProgress || 0} speed={uploadSpeed} />
        )}
      </div>

      {uploadStatus === UPLOAD_STATUS.UPLOADING && onCancel && (
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-full
            text-neutral-400 hover:text-red-500 hover:bg-red-50
            transition-all duration-200 shrink-0"
          aria-label="Cancelar upload"
        >
          ✕
        </button>
      )}

      {isUploadFailed && onRetry && (
        <button
          onClick={onRetry}
          className="w-8 h-8 flex items-center justify-center rounded-full
            bg-primary-50 text-primary-600 hover:bg-primary-100
            transition-all duration-200 shrink-0"
          aria-label="Tentar novamente"
        >
          ↻
        </button>
      )}

      {isComplete && onDownload && (
        <button
          onClick={onDownload}
          className="w-8 h-8 flex items-center justify-center rounded-full
            bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700
            hover:shadow-[0_0_12px_rgba(2,132,199,0.3)]
            transition-all duration-200 shrink-0"
          aria-label="Baixar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4v5.5M5.5 7.5L8 10l2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {onRemove && !status && !uploadStatus && (
        <button
          onClick={handleRemove}
          className="text-neutral-400 hover:text-red-500 p-1 rounded-lg
            hover:bg-red-50 transition-all duration-200 shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}

FileCard.propTypes = {
  file: PropTypes.object,
  localFile: PropTypes.object,
  previewUrl: PropTypes.string,
  status: PropTypes.string,
  convertedSize: PropTypes.number,
  onRemove: PropTypes.func,
  onDownload: PropTypes.func,
  uploadStatus: PropTypes.string,
  uploadProgress: PropTypes.number,
  uploadSpeed: PropTypes.number,
  uploadError: PropTypes.string,
  onRetry: PropTypes.func,
  onCancel: PropTypes.func,
};
