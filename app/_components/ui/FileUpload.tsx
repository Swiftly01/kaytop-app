'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LoadingSpinner, ProgressBar } from './LoadingSpinner';
import { useFileUploadProgress } from '@/app/hooks/useLoadingState';
import { useScreenReader, useHighContrast } from './AccessibilityUtils';

// Types and Interfaces
interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  placeholder?: string;
  uploadEndpoint?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  error?: string;
}

export default function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  onFileSelect,
  onFileRemove,
  onUploadProgress,
  onUploadComplete,
  onError,
  disabled = false,
  multiple = false,
  showPreview = true,
  className = '',
  placeholder = 'Click to upload or drag and drop',
  uploadEndpoint
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    uploads, 
    startUpload, 
    updateUploadProgress, 
    completeUpload, 
    failUpload,
    getTotalProgress,
    isAnyUploading
  } = useFileUploadProgress();
  
  const { announce, LiveRegion } = useScreenReader();
  const isHighContrast = useHighContrast();

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`;
    }

    // Check file type
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      return `File type not supported. Accepted types: ${accept}`;
    }

    return null;
  }, [maxSize, accept]);

  // Create file preview
  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(''); // No preview for non-image files
      }
    });
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    const validFiles: FileWithPreview[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        continue;
      }

      const fileWithPreview: FileWithPreview = file as FileWithPreview;
      
      if (showPreview && file.type.startsWith('image/')) {
        try {
          fileWithPreview.preview = await createPreview(file);
        } catch (err) {
          console.warn('Failed to create preview:', err);
        }
      }

      validFiles.push(fileWithPreview);
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      onFileSelect?.(newFiles);
      
      // Announce file selection to screen readers
      announce(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} selected for upload`);
    }
  }, [files, maxFiles, validateFile, createPreview, showPreview, multiple, onFileSelect, onError]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [disabled, handleFileSelect]);

  // Handle file removal
  const handleFileRemove = useCallback((index: number) => {
    const fileName = files[index]?.name;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileRemove?.(index);
    onFileSelect?.(newFiles);
    
    // Announce file removal to screen readers
    if (fileName) {
      announce(`File ${fileName} removed`);
    }
  }, [files, onFileRemove, onFileSelect, announce]);

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Upload files to server
  const uploadFiles = useCallback(async () => {
    if (!uploadEndpoint || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        const fileId = `${file.name}-${i}`;
        startUpload(fileId);

        // Track upload progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            updateUploadProgress(fileId, progress);
            setFiles(prev => prev.map((f, index) => 
              index === i ? { ...f, progress } : f
            ));
            onUploadProgress?.(progress);
          }
        };

        // Handle upload completion
        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response.url || response.data?.url || '');
              } catch (err) {
                reject(new Error('Invalid response format'));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadEndpoint);
        xhr.send(formData);

        try {
          const url = await uploadPromise;
          completeUpload(fileId);
          uploadedUrls.push(url);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          failUpload(fileId, errorMessage);
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, error: errorMessage } : f
          ));
          onError?.(errorMessage);
        }
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete?.(uploadedUrls);
      }
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadEndpoint, onUploadProgress, onUploadComplete, onError]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
        aria-label="File upload input"
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Upload files. ${placeholder}`}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2
          ${isDragOver 
            ? 'border-[#7F56D9] bg-[#F9F5FF]' 
            : 'border-[#D0D5DD] hover:border-[#7F56D9] hover:bg-[#F9F5FF]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Upload icon */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg 
            className="w-10 h-10 text-[#667085]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <div>
            <p className="text-sm font-medium text-[#344054]">
              {placeholder}
            </p>
            <p className="text-xs text-[#667085] mt-1">
              {accept === 'image/*' ? 'PNG, JPG, GIF up to' : 'Files up to'} {(maxSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          </div>
        </div>

        {/* Loading overlay */}
        {(isUploading || isAnyUploading()) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <LoadingSpinner size="md" />
              <span className="text-sm font-medium text-[#344054]">Uploading...</span>
              {isAnyUploading() && (
                <ProgressBar 
                  progress={getTotalProgress()} 
                  size="sm" 
                  className="w-32"
                  showLabel={false}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="flex items-center space-x-3 p-3 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg"
            >
              {/* File preview */}
              {showPreview && file.preview ? (
                <img 
                  src={file.preview} 
                  alt={`Preview of ${file.name}`}
                  className="w-10 h-10 object-cover rounded border"
                />
              ) : (
                <div className="w-10 h-10 bg-[#F2F4F7] border border-[#E4E7EC] rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#667085]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#344054] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[#667085]">
                  {formatFileSize(file.size)}
                </p>
                
                {/* Progress bar */}
                {file.progress !== undefined && file.progress < 100 && (
                  <div className="mt-1">
                    <ProgressBar 
                      progress={file.progress} 
                      size="sm" 
                      variant="primary"
                      showLabel={false}
                    />
                  </div>
                )}

                {/* Error message */}
                {file.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {file.error}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileRemove(index);
                }}
                className="p-1 text-[#667085] hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label={`Remove ${file.name}`}
                disabled={isUploading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {uploadEndpoint && files.length > 0 && !isUploading && (
        <button
          onClick={uploadFiles}
          className="mt-4 w-full px-4 py-2 bg-[#7F56D9] text-white rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
        </button>
      )}

      {/* Screen reader announcements */}
      <LiveRegion />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {files.length > 0 && `${files.length} file(s) selected`}
        {(isUploading || isAnyUploading()) && 'Files are being uploaded'}
        {isDragOver && 'Drop files here to upload'}
      </div>
    </div>
  );
}