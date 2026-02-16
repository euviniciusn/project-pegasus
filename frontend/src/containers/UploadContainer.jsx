import { useCallback } from 'react';
import { useJobContext } from '../contexts/JobContext.jsx';
import FileDropzone from '../components/FileDropzone.jsx';
import FileCard from '../components/FileCard.jsx';
import FormatSelector from '../components/FormatSelector.jsx';
import QualitySlider from '../components/QualitySlider.jsx';
import ConvertButton from '../components/ConvertButton.jsx';

export default function UploadContainer() {
  const {
    files, outputFormat, quality, errors, error,
    isProcessing, isCompleted,
    addFiles, removeFile, setOutputFormat, setQuality, startConversion,
  } = useJobContext();

  const handleRemove = useCallback((index) => () => removeFile(index), [removeFile]);

  const hasFiles = files.length > 0;
  const allErrors = [...errors, ...(error ? [error] : [])];

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone onFilesAdded={addFiles} fileCount={files.length} />

      {allErrors.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 p-3">
          {allErrors.map((msg, i) => (
            <p key={i} className="text-sm text-red-600">{msg}</p>
          ))}
        </div>
      )}

      {hasFiles && (
        <>
          <div className="flex flex-col gap-2">
            {files.map((file, index) => (
              <FileCard
                key={`${file.name}-${file.size}`}
                localFile={file}
                onRemove={handleRemove(index)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <FormatSelector
              value={outputFormat}
              onChange={setOutputFormat}
              files={files}
            />
            <QualitySlider
              value={quality}
              onChange={setQuality}
              outputFormat={outputFormat}
            />
          </div>

          <ConvertButton
            onClick={startConversion}
            isDisabled={!hasFiles}
            isProcessing={isProcessing}
            isCompleted={isCompleted}
          />
        </>
      )}
    </div>
  );
}
