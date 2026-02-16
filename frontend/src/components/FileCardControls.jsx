import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { OUTPUT_FORMATS, RESIZE_PRESETS_PAGE } from '../constants/index.js';

const FORMAT_LABELS = { webp: 'WebP', png: 'PNG', jpg: 'JPG', avif: 'AVIF' };

function CompactQualitySlider({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(Number(e.target.value)), [onChange]);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-xs text-neutral-500 shrink-0">Qualidade</span>
      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={handleChange}
        className="flex-1 h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-600"
      />
      <span className="text-xs font-semibold text-primary-600 w-8 text-right shrink-0">{value}%</span>
    </div>
  );
}

CompactQualitySlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

function CompactFormatSelect({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);

  return (
    <select
      value={value}
      onChange={handleChange}
      className="px-2 py-1 rounded-lg text-xs font-medium border border-neutral-200
        bg-white text-neutral-700 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      {OUTPUT_FORMATS.map((f) => (
        <option key={f} value={f}>{FORMAT_LABELS[f]}</option>
      ))}
    </select>
  );
}

CompactFormatSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function CompactResizePresets({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {RESIZE_PRESETS_PAGE.filter((p) => p.value !== 'custom').map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200
            ${value === preset.value
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-neutral-200 text-neutral-500 hover:border-primary-400'}`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

CompactResizePresets.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function FileCardControls({ mode, config, onChange }) {
  const setField = useCallback((field) => (value) => {
    onChange({ [field]: value });
  }, [onChange]);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1.5 mt-1.5 border-t border-neutral-100">
      {mode === 'convert' && (
        <>
          <CompactFormatSelect value={config.outputFormat} onChange={setField('outputFormat')} />
          <CompactQualitySlider value={config.quality} onChange={setField('quality')} />
        </>
      )}

      {mode === 'compress' && (
        <CompactQualitySlider value={config.quality} onChange={setField('quality')} />
      )}

      {mode === 'resize' && (
        <CompactResizePresets value={config.resizePreset || '50'} onChange={setField('resizePreset')} />
      )}
    </div>
  );
}

FileCardControls.propTypes = {
  mode: PropTypes.oneOf(['convert', 'compress', 'resize']).isRequired,
  config: PropTypes.shape({
    outputFormat: PropTypes.string,
    quality: PropTypes.number,
    resizePreset: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
