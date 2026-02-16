import { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useJobContext } from '../contexts/JobContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import FileDropzone from '../components/FileDropzone.jsx';
import FileCard from '../components/FileCard.jsx';
import FileCardControls from '../components/FileCardControls.jsx';
import GlobalConfig from '../components/GlobalConfig.jsx';
import ConvertButton from '../components/ConvertButton.jsx';
import UsageBanner from '../components/UsageBanner.jsx';

const BUTTON_LABELS = {
  convert: 'Converter',
  compress: 'Comprimir',
  resize: 'Redimensionar',
};

export default function UploadContainer({ mode }) {
  const {
    files, outputFormat, quality, errors, error,
    isProcessing, isCompleted, limits, remaining,
    resizePreset, customWidth, customHeight, isAspectRatioLocked, fileDimensions,
    applyToAll, fileConfigs,
    addFiles, removeFile, setOutputFormat, setQuality, startConversion,
    setResizePreset, setCustomWidth, setCustomHeight, setIsAspectRatioLocked,
    setApplyToAll, setFileConfig,
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

  const handleApplyToAllChange = useCallback((val) => {
    setApplyToAll(val, mode);
  }, [setApplyToAll, mode]);

  const handleFileConfigChange = useCallback((index) => (partial) => {
    setFileConfig(index, partial);
  }, [setFileConfig]);

  const hasFiles = files.length > 0;
  const isLimitExhausted = remaining !== null && remaining <= 0;

  return (
    <div className="flex flex-col gap-6">
      <UsageBanner remaining={remaining} max={limits?.maxConversionsPerDay} />

      <FileDropzone onFilesAdded={addFiles} fileCount={files.length} />

      {hasFiles && (
        <div className="animate-slide-up flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.size}`} className="animate-fade-in">
                <FileCard
                  localFile={file}
                  onRemove={handleRemove(index)}
                  controlsElement={
                    !applyToAll && fileConfigs[index]
                      ? <FileCardControls
                          mode={mode}
                          config={fileConfigs[index]}
                          onChange={handleFileConfigChange(index)}
                        />
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          <GlobalConfig
            mode={mode}
            applyToAll={applyToAll}
            onApplyToAllChange={handleApplyToAllChange}
            outputFormat={outputFormat}
            quality={quality}
            files={files}
            resizePreset={resizePreset}
            customWidth={customWidth}
            customHeight={customHeight}
            isAspectRatioLocked={isAspectRatioLocked}
            fileDimensions={fileDimensions}
            onFormatChange={setOutputFormat}
            onQualityChange={setQuality}
            onPresetChange={setResizePreset}
            onWidthChange={setCustomWidth}
            onHeightChange={setCustomHeight}
            onAspectRatioLockToggle={() => setIsAspectRatioLocked((prev) => !prev)}
          />

          <ConvertButton
            onClick={startConversion}
            isDisabled={!hasFiles || isLimitExhausted}
            isProcessing={isProcessing}
            isCompleted={isCompleted}
            label={BUTTON_LABELS[mode]}
          />
        </div>
      )}
    </div>
  );
}

UploadContainer.propTypes = {
  mode: PropTypes.oneOf(['convert', 'compress', 'resize']).isRequired,
};
