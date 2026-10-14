import { memo, FC, useState, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

interface FileUploadProps {
  files?: UploadFile[];
  onUpload?: (files: File[]) => Promise<void> | void;
  onRemove?: (fileId: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  id?: string;
  className?: string;
}

export const FileUpload: FC<FileUploadProps> = memo(
  (
    {
      files = [],
      onUpload,
      onRemove,
      maxFiles = 10,
      maxSizeMB = 5,
      accept = 'image/*',
      disabled = false,
      label,
      helperText,
      error,
      id,
      className,
    }
  ) => {
    const { dir } = useI18n();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAtMaxFiles = files.length >= maxFiles;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validateFiles = (fileList: FileList): File[] => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Check file size
        if (file.size > maxSizeBytes) {
          errors.push(
            `${file.name} exceeds ${maxSizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
          );
          continue;
        }

        // Check max files
        if (validFiles.length + files.length >= maxFiles) {
          errors.push(
            `Maximum ${maxFiles} files allowed (you have ${files.length})`
          );
          break;
        }

        validFiles.push(file);
      }

      return validFiles;
    };

    const handleFiles = async (fileList: FileList) => {
      const validFiles = validateFiles(fileList);
      if (validFiles.length > 0) {
        await onUpload?.(validFiles);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (!disabled) {
        e.preventDefault();
        setIsDragging(true);
      }
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      if (!disabled) {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }
    };

    const handleClick = () => {
      if (!disabled && !isAtMaxFiles) {
        fileInputRef.current?.click();
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    };

    const handleRemoveFile = (fileId: string) => {
      onRemove?.(fileId);
    };

    return (
      <div className="w-full space-y-4">
        {label && (
          <label className="block text-sm font-semibold text-primary-900">
            {label}
          </label>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative rounded-xl border-2 border-dashed transition-all cursor-pointer
            p-8 text-center
            ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-sand-50 border-sand-200'
                : isDragging
                  ? 'border-primary-300 bg-primary-50'
                  : error
                    ? 'border-error-300 bg-error-50'
                    : 'border-sand-200 bg-light-bg-100 hover:border-primary-300 hover:bg-primary-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled || isAtMaxFiles}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${
                  error
                    ? 'bg-error-100'
                    : isDragging
                      ? 'bg-primary-100'
                      : 'bg-sand-100'
                }
              `}
            >
              <Upload
                className={`w-6 h-6 ${
                  error
                    ? 'text-error-600'
                    : isDragging
                      ? 'text-primary-600'
                      : 'text-sand-500'
                }`}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-primary-900">
                {isAtMaxFiles
                  ? `Maximum ${maxFiles} files reached`
                  : 'Drag files here or click to upload'}
              </p>
              <p className="text-xs text-sand-500 mt-1">
                {`Max ${maxFiles} files, ${maxSizeMB}MB per file`}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 rounded-lg bg-error-50 border border-error-200">
            <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-error-600">{error}</p>
          </div>
        )}

        {helperText && !error && (
          <p className="text-xs text-sand-500">{helperText}</p>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-sand-600">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </p>
            <div className="space-y-2">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-sand-200 bg-white hover:bg-sand-50 transition-colors"
                >
                  {/* Preview/Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-sand-100 flex items-center justify-center overflow-hidden">
                    {fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-sand-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-900 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-sand-500">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {fileItem.status === 'uploading' && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
                        <span className="text-xs text-sand-500">
                          {fileItem.progress}%
                        </span>
                      </div>
                    )}

                    {fileItem.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    )}

                    {fileItem.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-error-600" />
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(fileItem.id)}
                      disabled={fileItem.status === 'uploading'}
                      className="p-1.5 rounded-lg hover:bg-error-50 text-sand-400 hover:text-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Remove ${fileItem.file.name}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar (if any file is uploading) */}
        {files.some((f) => f.status === 'uploading') && (
          <div className="w-full h-2 rounded-full bg-sand-100 overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{
                width: `${
                  files.reduce((sum, f) => sum + (f.status === 'uploading' ? f.progress : 100), 0) /
                  files.length
                }%`,
              }}
            />
          </div>
        )}

        {/* Error for Individual Files */}
        {files.some((f) => f.error) && (
          <div className="space-y-2">
            {files
              .filter((f) => f.error)
              .map((f) => (
                <div
                  key={f.id}
                  className="flex gap-2 p-2 rounded-lg bg-error-50 border border-error-200"
                >
                  <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-error-600">{f.error}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
