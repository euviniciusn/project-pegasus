import { useCallback } from 'react';
import PropTypes from 'prop-types';

const PRESETS = [
  { value: 60, label: 'Compressão máxima' },
  { value: 82, label: 'Recomendado' },
  { value: 95, label: 'Alta qualidade' },
];

export default function QualitySlider({ value, onChange, outputFormat }) {
  const isVisible = outputFormat !== 'png';

  const handleChange = useCallback((e) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">
          Qualidade
        </label>
        <span className="text-sm font-semibold text-primary-600">
          {value}%
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={handleChange}
        className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer
          accent-primary-600"
      />

      <div className="flex justify-between text-xs text-neutral-400">
        <span>Menor tamanho</span>
        <span>Maior qualidade</span>
      </div>

      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${value === preset.value
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-500 hover:border-primary-400 hover:text-neutral-700 hover:bg-primary-50/30'}
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

QualitySlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  outputFormat: PropTypes.string.isRequired,
};
