import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { RESIZE_PRESETS } from '../constants/index.js';

function LockIcon({ isLocked }) {
  if (isLocked) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

LockIcon.propTypes = {
  isLocked: PropTypes.bool.isRequired,
};

function getFirstFileDims(files, fileDimensions) {
  if (files.length === 0) return null;
  return fileDimensions[files[0].name] || null;
}

function DimensionInput({ value, onChange, placeholder, isDisabled }) {
  const handleChange = useCallback((e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(null); return; }
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num) && num > 0) onChange(num);
  }, [onChange]);

  return (
    <input
      type="number"
      min={1}
      max={16383}
      value={value ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={isDisabled}
      className="w-24 px-3 py-1.5 rounded-xl text-sm text-center
        border border-neutral-200 bg-white text-neutral-700
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        disabled:bg-neutral-100 disabled:text-neutral-400
        transition-all duration-200
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

DimensionInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
};

export default function ResizeSelector({
  resizePreset, customWidth, customHeight,
  isAspectRatioLocked, fileDimensions, files,
  onPresetChange, onWidthChange, onHeightChange, onAspectRatioLockToggle,
}) {
  const firstDims = useMemo(() => getFirstFileDims(files, fileDimensions), [files, fileDimensions]);
  const aspectRatio = firstDims ? firstDims.width / firstDims.height : null;

  const handleWidthChange = useCallback((w) => {
    onWidthChange(w);
    if (isAspectRatioLocked && aspectRatio && w) {
      onHeightChange(Math.round(w / aspectRatio));
    }
  }, [onWidthChange, onHeightChange, isAspectRatioLocked, aspectRatio]);

  const handleHeightChange = useCallback((h) => {
    onHeightChange(h);
    if (isAspectRatioLocked && aspectRatio && h) {
      onWidthChange(Math.round(h * aspectRatio));
    }
  }, [onWidthChange, onHeightChange, isAspectRatioLocked, aspectRatio]);

  const estimatedDims = useMemo(() => {
    if (!firstDims) return null;
    if (resizePreset === 'original') return firstDims;
    if (resizePreset === '50') return { width: Math.round(firstDims.width / 2), height: Math.round(firstDims.height / 2) };
    if (resizePreset === '25') return { width: Math.round(firstDims.width / 4), height: Math.round(firstDims.height / 4) };
    if (resizePreset === 'custom' && customWidth && customHeight) return { width: customWidth, height: customHeight };
    return null;
  }, [resizePreset, firstDims, customWidth, customHeight]);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-neutral-700">
        Redimensionar
      </label>

      <div className="flex flex-wrap gap-2">
        {RESIZE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onPresetChange(preset.value)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${resizePreset === preset.value
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-500 hover:border-primary-400 hover:text-neutral-700 hover:bg-primary-50/30'}
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {resizePreset === 'custom' && (
        <div className="flex items-center gap-2">
          <DimensionInput
            value={customWidth}
            onChange={handleWidthChange}
            placeholder="Largura"
          />
          <button
            type="button"
            onClick={onAspectRatioLockToggle}
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              isAspectRatioLocked
                ? 'text-primary-600 bg-primary-50'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            title={isAspectRatioLocked ? 'Proporção travada' : 'Proporção livre'}
          >
            <LockIcon isLocked={isAspectRatioLocked} />
          </button>
          <DimensionInput
            value={customHeight}
            onChange={handleHeightChange}
            placeholder="Altura"
          />
          <span className="text-xs text-neutral-400">px</span>
        </div>
      )}

      {estimatedDims && resizePreset !== 'original' && (
        <p className="text-xs text-neutral-500">
          Resultado estimado: {estimatedDims.width} x {estimatedDims.height} px
          {files.length > 1 && ' (baseado no primeiro arquivo)'}
        </p>
      )}
    </div>
  );
}

ResizeSelector.propTypes = {
  resizePreset: PropTypes.string.isRequired,
  customWidth: PropTypes.number,
  customHeight: PropTypes.number,
  isAspectRatioLocked: PropTypes.bool.isRequired,
  fileDimensions: PropTypes.object.isRequired,
  files: PropTypes.array.isRequired,
  onPresetChange: PropTypes.func.isRequired,
  onWidthChange: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
  onAspectRatioLockToggle: PropTypes.func.isRequired,
};
