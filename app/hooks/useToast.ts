'use client';

import { useState, useCallback } from 'react';
import { ToastType, ToastData } from '@/app/_components/ui/ToastContainer';

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = { id, type, message };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    return addToast('success', message);
  }, [addToast]);

  const error = useCallback((message: string) => {
    return addToast('error', message);
  }, [addToast]);

  const warning = useCallback((message: string) => {
    return addToast('warning', message);
  }, [addToast]);

  const info = useCallback((message: string) => {
    return addToast('info', message);
  }, [addToast]);

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
