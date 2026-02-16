import { useJobContext } from '../contexts/JobContext.jsx';
import UploadContainer from '../containers/UploadContainer.jsx';
import UploadPhaseContainer from '../containers/UploadPhaseContainer.jsx';
import ResultsContainer from '../containers/ResultsContainer.jsx';

function VectaLogo() {
  return (
    <svg width="36" height="31" viewBox="0 0 85.64 73.71" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vg1" x1="14.94" y1="79.54" x2="39.97" y2="20.28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcaa" />
          <stop offset="1" stopColor="#f8ad63" />
        </linearGradient>
        <linearGradient id="vg2" x1="13.18" y1="78.8" x2="38.21" y2="19.54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcaa" />
          <stop offset="1" stopColor="#f8ad63" />
        </linearGradient>
        <linearGradient id="vg3" x1="40.55" y1="90.36" x2="65.58" y2="31.1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcaa" />
          <stop offset="1" stopColor="#f8ad63" />
        </linearGradient>
      </defs>
      <path fill="url(#vg1)" d="M51.59,18.65l-8.96,12.41c-.36.5-1.11.5-1.47,0l-8.95-12.41c-1.26-1.75-1.26-4.1,0-5.85L41.16.38c.36-.5,1.11-.5,1.47,0l8.96,12.41c1.26,1.75,1.26,4.11,0,5.85Z" />
      <path fill="url(#vg2)" d="M51.97,73.71h-17.42c-2.59,0-4.95-1.47-6.1-3.78L0,12.62h19.57c.34,0,.66.2.81.5l19.36,38.98c.58,1.16,1.76,1.89,3.05,1.89h18.4c1.56,0,3.06-.58,4.21-1.63h0s-7.19,17.19-7.19,17.19c-1.05,2.52-3.51,4.15-6.24,4.15Z" />
      <path fill="url(#vg3)" d="M85.64,12.62h-16.98c-4.58,0-8.71,2.75-10.48,6.97l-12.88,30.81h15.93c2.75,0,5.22-1.65,6.28-4.18l11.64-27.82c1.17-2.81,3.56-4.93,6.48-5.78h0Z" />
    </svg>
  );
}

function Header() {
  return (
    <header className="py-8 flex flex-col items-center gap-3">
      <VectaLogo />
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)' }}
        >
          Vecta Convert
        </h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          Converta imagens com qualidade profissional
        </p>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-xs text-neutral-400">
        Powered by <span className="font-medium text-neutral-500">Vecta Solutions</span>
      </p>
    </footer>
  );
}

export default function ConverterPage() {
  const { isProcessing, isCompleted, jobFiles, isUploadPhase } = useJobContext();
  const hasActiveJob = isProcessing || isCompleted || jobFiles.length > 0;

  const showUploadPhase = isUploadPhase && !hasActiveJob;
  const showResults = hasActiveJob && !isUploadPhase;
  const showSelection = !showUploadPhase && !showResults;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col gap-6 py-4">
          {showSelection && (
            <div key="upload" className="animate-fade-in">
              <UploadContainer />
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
        </main>

        <Footer />
      </div>
    </div>
  );
}
