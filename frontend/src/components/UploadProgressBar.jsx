import PropTypes from 'prop-types';
import formatSpeed from '../utils/formatSpeed.js';

export default function UploadProgressBar({ progress, speed }) {
  const speedLabel = formatSpeed(speed);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{
            width: `${progress}%`,
            backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)',
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-400">{progress}%</span>
        {speedLabel && <span className="text-[10px] text-neutral-400">{speedLabel}</span>}
      </div>
    </div>
  );
}

UploadProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  speed: PropTypes.number,
};
