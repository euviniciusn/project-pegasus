import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ACCEPTED_INPUT_FORMATS, MAX_FILES_PER_JOB } from '../constants/index.js';

const ACCEPT_STRING = ACCEPTED_INPUT_FORMATS.join(',');

export default function FileDropzone({ onFilesAdded, fileCount }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  }, [onFilesAdded]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  }, [onFilesAdded]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center gap-3
        rounded-2xl border-2 border-dashed p-8 cursor-pointer
        transition-all duration-300
        ${isDragging
          ? 'border-primary-500 bg-primary-50 scale-[1.02]'
          : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'}
      `}
    >
      <div className="text-4xl">
        {isDragging ? '📥' : '📁'}
      </div>

      <p className="text-gray-600 text-center">
        {isDragging
          ? 'Solte os arquivos aqui'
          : 'Arraste imagens aqui ou clique para selecionar'}
      </p>

      <p className="text-xs text-gray-400">
        PNG e JPEG — até 20MB cada — {fileCount}/{MAX_FILES_PER_JOB} arquivos
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

FileDropzone.propTypes = {
  onFilesAdded: PropTypes.func.isRequired,
  fileCount: PropTypes.number.isRequired,
};
