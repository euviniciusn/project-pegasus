import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { OUTPUT_FORMATS } from '../constants/index.js';

const FORMAT_LABELS = { webp: 'WebP', png: 'PNG', jpg: 'JPG', avif: 'AVIF' };
const NEW_FORMATS = new Set(['avif']);

function hasAlphaFiles(files) {
  return files.some((f) => f.type === 'image/png');
}

export default function FormatSelector({ value, onChange, files }) {
  const showAlphaWarning = useMemo(
    () => (value === 'jpg' || value === 'avif') && hasAlphaFiles(files),
    [value, files],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-700">
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
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${value === format
                ? 'border-transparent bg-primary-600 text-white shadow-sm hover:bg-primary-500'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-400 hover:text-neutral-700 hover:bg-primary-50/30'}
            `}
          >
            {FORMAT_LABELS[format]}
            {NEW_FORMATS.has(format) && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full bg-green-100 text-green-700">
                Novo
              </span>
            )}
          </button>
        ))}
      </div>

      {showAlphaWarning && (
        <p className="text-xs text-yellow-600">
          {value === 'jpg' ? 'JPG' : 'AVIF'} não suporta transparência. PNGs com alpha terão fundo branco.
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
