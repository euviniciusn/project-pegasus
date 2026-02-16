import { useCallback } from 'react';
import { useJobContext } from '../contexts/JobContext.jsx';
import { FILE_STATUS } from '../constants/index.js';
import FileCard from '../components/FileCard.jsx';
import ResultsSummary from '../components/ResultsSummary.jsx';

function triggerDownload(url, fileName) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ResultsContainer() {
  const { jobFiles, previews, isCompleted, getDownloadUrl, reset } = useJobContext();

  const handleDownload = useCallback((fileId, fileName) => async () => {
    try {
      const { url } = await getDownloadUrl(fileId);
      triggerDownload(url, fileName);
    } catch {
      /* error handled by context */
    }
  }, [getDownloadUrl]);

  const handleDownloadAll = useCallback(async () => {
    const completed = jobFiles.filter((f) => f.status === FILE_STATUS.COMPLETED);
    for (const file of completed) {
      try {
        const { url } = await getDownloadUrl(file.id);
        triggerDownload(url, file.original_name);
      } catch {
        /* best effort */
      }
    }
  }, [jobFiles, getDownloadUrl]);

  if (jobFiles.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Arquivos</h2>

      <div className="flex flex-col gap-2">
        {jobFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            status={file.status}
            previewUrl={previews[file.original_name]}
            convertedSize={file.converted_size ? Number(file.converted_size) : undefined}
            onDownload={
              file.status === FILE_STATUS.COMPLETED
                ? handleDownload(file.id, file.original_name)
                : undefined
            }
          />
        ))}
      </div>

      {isCompleted && (
        <ResultsSummary
          files={jobFiles}
          onDownloadAll={handleDownloadAll}
          onReset={reset}
        />
      )}
    </div>
  );
}
