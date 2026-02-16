import PropTypes from 'prop-types';
import FormatSelector from './FormatSelector.jsx';
import QualitySlider from './QualitySlider.jsx';
import ResizeSelector from './ResizeSelector.jsx';
import { RESIZE_PRESETS_PAGE } from '../constants/index.js';

function CheckboxToggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-neutral-300 text-primary-600
          focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 cursor-pointer"
      />
      <span className="text-sm font-medium text-neutral-700">{label}</span>
    </label>
  );
}

CheckboxToggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default function GlobalConfig({
  mode, applyToAll, onApplyToAllChange,
  outputFormat, quality, files,
  resizePreset, customWidth, customHeight, isAspectRatioLocked, fileDimensions,
  onFormatChange, onQualityChange,
  onPresetChange, onWidthChange, onHeightChange, onAspectRatioLockToggle,
}) {
  return (
    <div className="flex flex-col gap-4">
      <CheckboxToggle
        checked={applyToAll}
        onChange={onApplyToAllChange}
        label="Aplicar para todos os arquivos"
      />

      {applyToAll && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {mode === 'convert' && (
            <>
              <FormatSelector value={outputFormat} onChange={onFormatChange} files={files} />
              <QualitySlider value={quality} onChange={onQualityChange} outputFormat={outputFormat} />
            </>
          )}

          {mode === 'compress' && (
            <QualitySlider value={quality} onChange={onQualityChange} outputFormat="jpg" />
          )}

          {mode === 'resize' && (
            <ResizeSelector
              resizePreset={resizePreset}
              customWidth={customWidth}
              customHeight={customHeight}
              isAspectRatioLocked={isAspectRatioLocked}
              fileDimensions={fileDimensions}
              files={files}
              onPresetChange={onPresetChange}
              onWidthChange={onWidthChange}
              onHeightChange={onHeightChange}
              onAspectRatioLockToggle={onAspectRatioLockToggle}
              presets={RESIZE_PRESETS_PAGE}
            />
          )}
        </div>
      )}
    </div>
  );
}

GlobalConfig.propTypes = {
  mode: PropTypes.oneOf(['convert', 'compress', 'resize']).isRequired,
  applyToAll: PropTypes.bool.isRequired,
  onApplyToAllChange: PropTypes.func.isRequired,
  outputFormat: PropTypes.string.isRequired,
  quality: PropTypes.number.isRequired,
  files: PropTypes.array.isRequired,
  resizePreset: PropTypes.string,
  customWidth: PropTypes.number,
  customHeight: PropTypes.number,
  isAspectRatioLocked: PropTypes.bool,
  fileDimensions: PropTypes.object,
  onFormatChange: PropTypes.func,
  onQualityChange: PropTypes.func,
  onPresetChange: PropTypes.func,
  onWidthChange: PropTypes.func,
  onHeightChange: PropTypes.func,
  onAspectRatioLockToggle: PropTypes.func,
};
