import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FILE_STATUS } from '../constants/index.js';
import formatBytes from '../utils/formatBytes.js';

function StatusBadge({ status }) {
  const config = {
    [FILE_STATUS.PENDING]: { label: 'Pendente', style: 'text-gray-400' },
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

export default function FileCard({ file, localFile, status, convertedSize, onRemove, onDownload }) {
  const [preview, setPreview] = useState(null);
  const name = file?.original_name || localFile?.name;
  const size = file?.original_size || localFile?.size;
  const isComplete = status === FILE_STATUS.COMPLETED;
  const isFailed = status === FILE_STATUS.FAILED;

  useEffect(() => {
    if (!localFile) return;
    const url = URL.createObjectURL(localFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onRemove?.();
  }, [onRemove]);

  return (
    <div className={`
      flex items-center gap-3 rounded-xl p-3
      border transition-all duration-200
      ${isFailed ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white shadow-sm'}
    `}>
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {preview && <img src={preview} alt={name} className="w-full h-full object-cover" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{name}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatBytes(size)}</span>
          {isComplete && <SavingsBadge originalSize={size} convertedSize={convertedSize} />}
          {status && <StatusBadge status={status} />}
        </div>
      </div>

      {isComplete && onDownload && (
        <button
          onClick={onDownload}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded
            transition-colors shrink-0"
        >
          Baixar
        </button>
      )}

      {onRemove && !status && (
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-500 p-1 rounded
            transition-colors shrink-0"
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
  status: PropTypes.string,
  convertedSize: PropTypes.number,
  onRemove: PropTypes.func,
  onDownload: PropTypes.func,
};
