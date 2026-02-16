import { useJobContext } from '../contexts/JobContext.jsx';
import UploadContainer from '../containers/UploadContainer.jsx';
import ResultsContainer from '../containers/ResultsContainer.jsx';

function Header() {
  return (
    <header className="py-6 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
        Image Converter
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Converta PNG e JPEG para WebP, PNG ou JPG
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-xs text-gray-400">
        Conversor de imagens — Projeto Pegasus
      </p>
    </footer>
  );
}

export default function ConverterPage() {
  const { isProcessing, isCompleted, jobFiles } = useJobContext();
  const hasActiveJob = isProcessing || isCompleted || jobFiles.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col gap-6 py-4">
          {!hasActiveJob && <UploadContainer />}
          {hasActiveJob && <ResultsContainer />}
        </main>

        <Footer />
      </div>
    </div>
  );
}
