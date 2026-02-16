import { useMemo } from 'react';
import { useJobContext } from '../contexts/JobContext.jsx';
import FileCard from '../components/FileCard.jsx';
import { UPLOAD_STATUS } from '../constants/index.js';

function UploadSummary({ fileUploads }) {
  const { completed, failed, total } = useMemo(() => {
    const entries = Object.values(fileUploads);
    return {
      completed: entries.filter((f) => f.status === UPLOAD_STATUS.COMPLETED).length,
      failed: entries.filter((f) => f.status === UPLOAD_STATUS.FAILED || f.status === UPLOAD_STATUS.CANCELLED).length,
      total: entries.length,
    };
  }, [fileUploads]);

  return (
    <div className="text-center">
      <p className="text-sm text-neutral-600">
        <span className="font-semibold text-neutral-700">{completed}</span>
        <span className="text-neutral-400"> / {total} enviados</span>
        {failed > 0 && (
          <span className="text-red-500 ml-2">{failed} falha{failed > 1 ? 's' : ''}</span>
        )}
      </p>
    </div>
  );
}

export default function UploadPhaseContainer() {
  const {
    files, fileUploads, previews, hasUploadFailures,
    allUploadsCompleted, retryUpload, cancelUpload, confirmWithFailures,
  } = useJobContext();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-neutral-700">Enviando arquivos</h2>
        <p className="text-sm text-neutral-400 mt-1">
          {allUploadsCompleted
            ? 'Upload finalizado'
            : 'Aguarde enquanto seus arquivos são enviados...'}
        </p>
      </div>

      <UploadSummary fileUploads={fileUploads} />

      <div className="flex flex-col gap-2">
        {files.map((file) => {
          const upload = fileUploads[file.name];
          if (!upload) return null;

          return (
            <div key={`${file.name}-${file.size}`} className="animate-fade-in">
              <FileCard
                localFile={file}
                previewUrl={previews[file.name]}
                uploadStatus={upload.status}
                uploadProgress={upload.progress}
                uploadSpeed={upload.speed}
                uploadError={upload.error}
                onRetry={() => retryUpload(file.name)}
                onCancel={() => cancelUpload(file.name)}
              />
            </div>
          );
        })}
      </div>

      {allUploadsCompleted && hasUploadFailures && (
        <button
          onClick={confirmWithFailures}
          className="w-full py-3 px-4 rounded-2xl text-sm font-semibold
            text-white transition-all duration-300 shadow-md hover:shadow-lg
            hover:-translate-y-0.5 active:translate-y-0"
          style={{ backgroundImage: 'linear-gradient(to right, #3dbff2, #020f59)' }}
        >
          Converter arquivos enviados
        </button>
      )}
    </div>
  );
}
