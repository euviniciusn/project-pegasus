import PropTypes from 'prop-types';

export default function ProgressBar({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600">
          Convertendo {completed}/{total}
        </span>
        <span className="text-xs font-semibold text-primary-600">
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{
            width: `${percent}%`,
            backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)',
          }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  completed: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
