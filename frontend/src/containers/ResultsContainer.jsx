import { useCallback } from 'react';
import { useJobContext } from '../contexts/JobContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { getDownloadAllUrl } from '../services/api.js';
import { FILE_STATUS } from '../constants/index.js';
import FileCard from '../components/FileCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
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
  const { job, jobFiles, previews, isProcessing, isCompleted, getDownloadUrl, reset } = useJobContext();
  const { addToast } = useToast();
  const outputFormat = job?.output_format;

  const completedCount = job?.completed_files ?? 0;
  const failedCount = job?.failed_files ?? 0;
  const totalFiles = job?.total_files ?? 0;
  const hasFiles = jobFiles.length > 0;
  const isWaitingFirstPoll = isProcessing && !hasFiles;

  const handleDownload = useCallback((fileId, originalName) => async () => {
    try {
      const { url } = await getDownloadUrl(fileId);
      triggerDownload(url, replaceExtension(originalName, outputFormat));
    } catch {
      addToast('Falha ao gerar link de download', 'error');
    }
  }, [getDownloadUrl, outputFormat, addToast]);

  const handleDownloadAll = useCallback(() => {
    if (!job?.id) return;
    const url = getDownloadAllUrl(job.id);
    window.open(url, '_blank');
  }, [job?.id]);

  return (
    <div className="flex flex-col gap-4">
      {isProcessing && (
        <ProgressBar completed={completedCount + failedCount} total={totalFiles} />
      )}

      <h2 className="text-lg font-semibold text-neutral-900">Arquivos</h2>

      <div className="flex flex-col gap-2">
        {isWaitingFirstPoll && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {jobFiles.map((file) => (
          <div key={file.id} className="animate-fade-in">
            <FileCard
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
          </div>
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
