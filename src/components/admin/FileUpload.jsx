import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FileUpload({
  onFileSelect,
  accept = '.json',
  maxSizeMB = 5,
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file) => {
    setError(null);

    // Check file type
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(extension)) {
      setError(t('fileUpload.wrongType', { accept }));
      return false;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(t('fileUpload.tooLarge', { maxSizeMB }));
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-accent bg-accent/5'
            : error
            ? 'border-red-300 bg-red-50/50'
            : selectedFile
            ? 'border-green-300 bg-green-50/50'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <File className="w-8 h-8 text-green-600" />
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
              <p className="text-xs text-muted">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
              disabled={disabled}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className={`w-12 h-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-300'}`} />
            <p className="text-base font-medium text-primary mb-1">
              {isDragging ? t('fileUpload.dropHere') : t('fileUpload.dragDrop')}
            </p>
            <p className="text-sm text-muted mb-4">{t('fileUpload.or')}</p>
            <span className="inline-block px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium text-sm rounded-xl transition-colors">
              {t('fileUpload.browse')}
            </span>
            <p className="text-xs text-muted mt-4">
              {t('fileUpload.accepts', { accept, maxSizeMB })}
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1.5">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
