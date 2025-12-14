'use client';

import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

export interface LoadingOptions {
  initialMessage?: string;
  showProgress?: boolean;
  timeout?: number;
}

export function useLoadingState(options: LoadingOptions = {}) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: options.initialMessage
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message: message || options.initialMessage,
      error: undefined
    });

    // Set timeout if specified
    if (options.timeout) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Operation timed out'
        }));
      }, options.timeout);
    }
  }, [options.initialMessage, options.timeout]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const stopLoading = useCallback((error?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isLoading: false,
      progress: error ? 0 : 100,
      message: undefined,
      error
    });
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isLoading: false,
      progress: 0,
      message: options.initialMessage,
      error: undefined
    });
  }, [options.initialMessage]);

  // Wrapper for async operations
  const withLoading = useCallback(async <T>(
    operation: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>,
    loadingMessage?: string
  ): Promise<T | null> => {
    try {
      startLoading(loadingMessage);
      const result = await operation(updateProgress);
      stopLoading();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      stopLoading(errorMessage);
      return null;
    }
  }, [startLoading, stopLoading, updateProgress]);

  return {
    ...state,
    startLoading,
    updateProgress,
    updateMessage,
    stopLoading,
    reset,
    withLoading
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates() {
  const [states, setStates] = useState<Record<string, LoadingState>>({});

  const startLoading = useCallback((key: string, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        progress: 0,
        message,
        error: undefined
      }
    }));
  }, []);

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.min(100, Math.max(0, progress)),
        message: message || prev[key]?.message
      }
    }));
  }, []);

  const stopLoading = useCallback((key: string, error?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        progress: error ? 0 : 100,
        message: undefined,
        error
      }
    }));
  }, []);

  const getState = useCallback((key: string): LoadingState => {
    return states[key] || { isLoading: false, progress: 0 };
  }, [states]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(states).some(state => state.isLoading);
  }, [states]);

  const clearState = useCallback((key: string) => {
    setStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const clearAllStates = useCallback(() => {
    setStates({});
  }, []);

  return {
    states,
    startLoading,
    updateProgress,
    stopLoading,
    getState,
    isAnyLoading,
    clearState,
    clearAllStates
  };
}

// Hook for file upload progress
export function useFileUploadProgress() {
  const [uploads, setUploads] = useState<Record<string, {
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
  }>>({});

  const startUpload = useCallback((fileId: string) => {
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        progress: 0,
        status: 'uploading'
      }
    }));
  }, []);

  const updateUploadProgress = useCallback((fileId: string, progress: number) => {
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        progress: Math.min(100, Math.max(0, progress))
      }
    }));
  }, []);

  const completeUpload = useCallback((fileId: string) => {
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        progress: 100,
        status: 'completed'
      }
    }));
  }, []);

  const failUpload = useCallback((fileId: string, error: string) => {
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: 'error',
        error
      }
    }));
  }, []);

  const removeUpload = useCallback((fileId: string) => {
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fileId];
      return newUploads;
    });
  }, []);

  const getUploadState = useCallback((fileId: string) => {
    return uploads[fileId];
  }, [uploads]);

  const getTotalProgress = useCallback((): number => {
    const uploadList = Object.values(uploads);
    if (uploadList.length === 0) return 0;
    
    const totalProgress = uploadList.reduce((sum, upload) => sum + upload.progress, 0);
    return totalProgress / uploadList.length;
  }, [uploads]);

  const isAnyUploading = useCallback((): boolean => {
    return Object.values(uploads).some(upload => upload.status === 'uploading');
  }, [uploads]);

  return {
    uploads,
    startUpload,
    updateUploadProgress,
    completeUpload,
    failUpload,
    removeUpload,
    getUploadState,
    getTotalProgress,
    isAnyUploading
  };
}