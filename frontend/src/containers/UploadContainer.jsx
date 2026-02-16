import { useCallback, useEffect, useRef } from 'react';
import { useJobContext } from '../contexts/JobContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import FileDropzone from '../components/FileDropzone.jsx';
import FileCard from '../components/FileCard.jsx';
import FormatSelector from '../components/FormatSelector.jsx';
import QualitySlider from '../components/QualitySlider.jsx';
import ResizeSelector from '../components/ResizeSelector.jsx';
import ConvertButton from '../components/ConvertButton.jsx';

export default function UploadContainer() {
  const {
    files, outputFormat, quality, errors, error,
    isProcessing, isCompleted,
    resizePreset, customWidth, customHeight, isAspectRatioLocked, fileDimensions,
    addFiles, removeFile, setOutputFormat, setQuality, startConversion,
    setResizePreset, setCustomWidth, setCustomHeight, setIsAspectRatioLocked,
  } = useJobContext();
  const { addToast } = useToast();
  const prevErrorRef = useRef(null);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      addToast(error, 'error');
    }
    prevErrorRef.current = error;
  }, [error, addToast]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((msg) => addToast(msg, 'error'));
    }
  }, [errors, addToast]);

  const handleRemove = useCallback((index) => () => removeFile(index), [removeFile]);

  const hasFiles = files.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone onFilesAdded={addFiles} fileCount={files.length} />

      {hasFiles && (
        <div className="animate-slide-up flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.size}`} className="animate-fade-in">
                <FileCard
                  localFile={file}
                  onRemove={handleRemove(index)}
                />
              </div>
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
            <ResizeSelector
              resizePreset={resizePreset}
              customWidth={customWidth}
              customHeight={customHeight}
              isAspectRatioLocked={isAspectRatioLocked}
              fileDimensions={fileDimensions}
              files={files}
              onPresetChange={setResizePreset}
              onWidthChange={setCustomWidth}
              onHeightChange={setCustomHeight}
              onAspectRatioLockToggle={() => setIsAspectRatioLocked((prev) => !prev)}
            />
          </div>

          <ConvertButton
            onClick={startConversion}
            isDisabled={!hasFiles}
            isProcessing={isProcessing}
            isCompleted={isCompleted}
          />
        </div>
      )}
    </div>
  );
}
