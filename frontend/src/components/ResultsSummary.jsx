import PropTypes from 'prop-types';
import { FILE_STATUS } from '../constants/index.js';
import formatBytes from '../utils/formatBytes.js';

function computeStats(files) {
  let totalOriginal = 0;
  let totalConverted = 0;
  let completedCount = 0;
  let failedCount = 0;

  for (const file of files) {
    if (file.status === FILE_STATUS.COMPLETED) {
      totalOriginal += Number(file.original_size);
      totalConverted += Number(file.converted_size);
      completedCount++;
    } else if (file.status === FILE_STATUS.FAILED) {
      failedCount++;
    }
  }

  const savingsPercent = totalOriginal > 0
    ? ((totalOriginal - totalConverted) / totalOriginal * 100).toFixed(1)
    : '0.0';

  return { totalOriginal, totalConverted, completedCount, failedCount, savingsPercent };
}

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xl font-bold text-neutral-900">{value}</span>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default function ResultsSummary({ files, onDownloadAll, onReset }) {
  const stats = computeStats(files);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-6 flex flex-col gap-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-neutral-900">Resultado</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatItem label="Convertidos" value={`${stats.completedCount}/${files.length}`} />
        <StatItem label="Antes" value={formatBytes(stats.totalOriginal)} />
        <StatItem label="Depois" value={formatBytes(stats.totalConverted)} />
        <StatItem label="Economia" value={`${stats.savingsPercent}%`} />
      </div>

      {stats.failedCount > 0 && (
        <p className="text-xs text-red-500">
          {stats.failedCount} arquivo(s) falharam na conversão.
        </p>
      )}

      <div className="flex gap-3">
        {stats.completedCount > 0 && (
          <button
            type="button"
            onClick={onDownloadAll}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold
              border border-transparent text-white
              shadow-lg hover:shadow-xl hover:opacity-90
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            style={{ backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)' }}
          >
            Baixar todos
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium
            border border-neutral-200 bg-white text-neutral-600
            hover:bg-neutral-50 hover:text-neutral-800 hover:border-neutral-300
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
        >
          Nova conversão
        </button>
      </div>
    </div>
  );
}

ResultsSummary.propTypes = {
  files: PropTypes.array.isRequired,
  onDownloadAll: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};
