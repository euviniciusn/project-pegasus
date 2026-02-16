import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { OUTPUT_FORMATS } from '../constants/index.js';

const FORMAT_LABELS = { webp: 'WebP', png: 'PNG', jpg: 'JPG' };

function hasAlphaFiles(files) {
  return files.some((f) => f.type === 'image/png');
}

export default function FormatSelector({ value, onChange, files }) {
  const showAlphaWarning = useMemo(
    () => value === 'jpg' && hasAlphaFiles(files),
    [value, files],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Formato de saída
      </label>

      <div className="flex gap-2">
        {OUTPUT_FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => onChange(format)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              border transition-all duration-200
              ${value === format
                ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                : 'border-gray-300 bg-white text-gray-500 hover:border-primary-400 hover:text-gray-700'}
            `}
          >
            {FORMAT_LABELS[format]}
          </button>
        ))}
      </div>

      {showAlphaWarning && (
        <p className="text-xs text-yellow-600">
          JPG não suporta transparência. PNGs com alpha terão fundo branco.
        </p>
      )}
    </div>
  );
}

FormatSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
};
