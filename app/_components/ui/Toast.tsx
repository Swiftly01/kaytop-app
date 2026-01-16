'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({ id, type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
              fill="#12B76A"
            />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
              fill="#F04438"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
              fill="#FF9326"
            />
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z"
              fill="#7F56D9"
            />
          </svg>
        );
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ECFDF3',
          border: '#12B76A',
          text: '#027A48',
        };
      case 'error':
        return {
          bg: '#FEF3F2',
          border: '#F04438',
          text: '#B42318',
        };
      case 'warning':
        return {
          bg: 'rgba(255, 147, 38, 0.1)',
          border: '#FF9326',
          text: '#CC7720',
        };
      case 'info':
        return {
          bg: '#F4F3FF',
          border: '#7F56D9',
          text: '#5925DC',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-in-right"
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        minWidth: '320px',
        maxWidth: '420px',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      
      <div className="flex-1">
        <p
          className="text-sm font-medium leading-5"
          style={{ color: styles.text }}
        >
          {message}
        </p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke={styles.text}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
