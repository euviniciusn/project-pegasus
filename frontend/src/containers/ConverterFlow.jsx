import PropTypes from 'prop-types';
import { useJobContext } from '../contexts/JobContext.jsx';
import UploadContainer from './UploadContainer.jsx';
import UploadPhaseContainer from './UploadPhaseContainer.jsx';
import ResultsContainer from './ResultsContainer.jsx';

export default function ConverterFlow({ mode, title, subtitle }) {
  const { isProcessing, isCompleted, jobFiles, isUploadPhase } = useJobContext();
  const hasActiveJob = isProcessing || isCompleted || jobFiles.length > 0;

  const showUploadPhase = isUploadPhase && !hasActiveJob;
  const showResults = hasActiveJob && !isUploadPhase;
  const showSelection = !showUploadPhase && !showResults;

  return (
    <>
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)' }}
        >
          {title}
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5">{subtitle}</p>
      </div>

      {showSelection && (
        <div key="upload" className="animate-fade-in">
          <UploadContainer mode={mode} />
        </div>
      )}
      {showUploadPhase && (
        <div key="upload-phase" className="animate-slide-up">
          <UploadPhaseContainer />
        </div>
      )}
      {showResults && (
        <div key="results" className="animate-slide-up">
          <ResultsContainer />
        </div>
      )}
    </>
  );
}

ConverterFlow.propTypes = {
  mode: PropTypes.oneOf(['convert', 'compress', 'resize']).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};
