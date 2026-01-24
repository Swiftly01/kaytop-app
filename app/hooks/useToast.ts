import { useState, useCallback, useId } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const baseId = useId();

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 5000) => {
    const id = `${baseId}-${Date.now()}-${toasts.length}`;
    const toast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    
    return id;
  }, [baseId, toasts.length]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => 
    addToast(message, 'success', duration), [addToast]);
    
  const error = useCallback((message: string, duration?: number) => 
    addToast(message, 'error', duration), [addToast]);
    
  const warning = useCallback((message: string, duration?: number) => 
    addToast(message, 'warning', duration), [addToast]);
    
  const info = useCallback((message: string, duration?: number) => 
    addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}