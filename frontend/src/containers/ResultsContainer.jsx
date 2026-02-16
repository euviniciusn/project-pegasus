import { useCallback } from 'react';
import { useJobContext } from '../contexts/JobContext.jsx';
import { FILE_STATUS } from '../constants/index.js';
import FileCard from '../components/FileCard.jsx';
import ResultsSummary from '../components/ResultsSummary.jsx';

function replaceExtension(fileName, format) {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return `${base}.${format}`;
}

function triggerDownload(url, fileName) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ResultsContainer() {
  const { job, jobFiles, previews, isCompleted, getDownloadUrl, reset } = useJobContext();
  const outputFormat = job?.output_format;

  const handleDownload = useCallback((fileId, originalName) => async () => {
    try {
      const { url } = await getDownloadUrl(fileId);
      triggerDownload(url, replaceExtension(originalName, outputFormat));
    } catch {
      /* error handled by context */
    }
  }, [getDownloadUrl, outputFormat]);

  const handleDownloadAll = useCallback(async () => {
    const completed = jobFiles.filter((f) => f.status === FILE_STATUS.COMPLETED);
    for (const file of completed) {
      try {
        const { url } = await getDownloadUrl(file.id);
        triggerDownload(url, replaceExtension(file.original_name, outputFormat));
      } catch {
        /* best effort */
      }
    }
  }, [jobFiles, getDownloadUrl, outputFormat]);

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
