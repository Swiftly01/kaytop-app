/**
 * Error Boundary for HQ Dashboard Enhancements
 * Provides graceful error handling and fallback UI for enhanced features
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class HQDashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('HQ Dashboard Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service if needed
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="bg-white rounded-lg border border-[#EAECF0] p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-red-50 rounded-full">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            We encountered an error while loading this section. The rest of the dashboard should continue to work normally.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-[#7F56D9] text-white text-sm font-medium rounded-lg hover:bg-[#6941C6] transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-[#D0D5DD] text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details (Development Only)
              </summary>
              <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withHQErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <HQDashboardErrorBoundary fallback={fallback}>
      <Component {...props} />
    </HQDashboardErrorBoundary>
  );

  WrappedComponent.displayName = `withHQErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specific error boundary for leaderboard components
export const LeaderboardErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <HQDashboardErrorBoundary
    fallback={
      <div className="bg-white rounded-lg border border-[#EAECF0] p-6 text-center">
        <div className="text-yellow-600 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h4 className="font-medium text-gray-900 mb-1">Leaderboard Unavailable</h4>
        <p className="text-sm text-gray-600 mb-3">
          Unable to load performance rankings. Please try refreshing or check back later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium"
        >
          Refresh
        </button>
      </div>
    }
  >
    {children}
  </HQDashboardErrorBoundary>
);

// Specific error boundary for reports components
export const ReportsErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <HQDashboardErrorBoundary
    fallback={
      <div className="bg-white rounded-lg border border-[#EAECF0] p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="font-medium text-gray-900 mb-1">Reports Unavailable</h4>
        <p className="text-sm text-gray-600 mb-3">
          Unable to load reports data. The system may be temporarily unavailable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium"
        >
          Refresh
        </button>
      </div>
    }
  >
    {children}
  </HQDashboardErrorBoundary>
);