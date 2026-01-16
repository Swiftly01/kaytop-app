'use client';

import { useState } from 'react';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  error?: Error;
  className?: string;
}

export function ErrorDisplay({
  title,
  message,
  type = 'error',
  showRetry = false,
  showDetails = false,
  onRetry,
  onDismiss,
  error,
  className = ''
}: ErrorDisplayProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
        };
    }
  };

  const styles = getTypeStyles();

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${styles.container} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          
          <p className={`${title ? 'mt-1' : ''} text-sm ${styles.message}`}>
            {message}
          </p>
          
          {(showRetry || showDetails || (error && process.env.NODE_ENV === 'development')) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
                >
                  Try Again
                </button>
              )}
              
              {showDetails && error && process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className={`text-sm px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
                >
                  {showErrorDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>
          )}
          
          {showErrorDetails && error && process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded-md">
              <h4 className="text-xs font-medium text-gray-800 mb-2">Error Details (Development Only)</h4>
              <pre className="text-xs text-gray-700 overflow-auto whitespace-pre-wrap">
                {error.stack || error.message}
              </pre>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onDismiss}
              className={`${styles.icon} hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined error display components for common scenarios
export function NetworkErrorDisplay({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <ErrorDisplay
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      type="warning"
      showRetry={!!onRetry}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function AuthErrorDisplay({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <ErrorDisplay
      title="Authentication Required"
      message="Your session has expired. Please log in again to continue."
      type="warning"
      showRetry={!!onRetry}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function ServerErrorDisplay({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <ErrorDisplay
      title="Server Error"
      message="We're experiencing technical difficulties. Please try again in a few moments."
      type="error"
      showRetry={!!onRetry}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function ValidationErrorDisplay({ 
  errors, 
  onDismiss 
}: { 
  errors: string[]; 
  onDismiss?: () => void; 
}) {
  const message = errors.length === 1 
    ? errors[0] 
    : `Please fix the following ${errors.length} errors: ${errors.join(', ')}`;

  return (
    <ErrorDisplay
      title="Validation Error"
      message={message}
      type="warning"
      onDismiss={onDismiss}
    />
  );
}