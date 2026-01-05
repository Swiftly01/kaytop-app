'use client';

import { ReactNode } from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'gray';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const variantClasses = {
  primary: 'border-[#7F56D9] border-t-transparent',
  secondary: 'border-[#667085] border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-300 border-t-transparent'
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  return (
    <div 
      className={`inline-block ${sizeClasses[size]} border-2 rounded-full animate-spin ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Button with loading state
interface LoadingButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loadingText?: string;
}

export function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText = 'Loading...'
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[#7F56D9] text-white hover:bg-[#6941C6] focus:ring-[#7F56D9] border border-[#7F56D9]',
    secondary: 'bg-white text-[#344054] hover:bg-[#F9FAFB] focus:ring-[#7F56D9] border border-[#D0D5DD]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading && (
        <LoadingSpinner 
          size="sm" 
          variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} 
          className="mr-2" 
        />
      )}
      {isLoading ? loadingText : children}
    </button>
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  backdrop?: boolean;
}

export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  backdrop = true 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center`}
      style={{
        backgroundColor: backdrop ? 'rgba(52, 64, 84, 0.7)' : 'transparent',
        backdropFilter: backdrop ? 'blur(16px)' : 'none'
      }}
    >
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
        <div className="flex flex-col items-center text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-[#344054] font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Inline loading state for content areas
interface LoadingContentProps {
  isLoading: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function LoadingContent({ 
  isLoading, 
  children, 
  fallback,
  className = '' 
}: LoadingContentProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        {fallback || (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-[#667085]">Loading content...</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// Progress bar component
interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  className = ''
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    primary: 'bg-[#7F56D9]',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#344054]">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-[#667085]">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${variantClasses[variant]}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// Circular progress indicator
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  progress,
  size = 64,
  strokeWidth = 4,
  variant = 'primary',
  showLabel = false,
  className = ''
}: CircularProgressProps) {
  const variantColors = {
    primary: '#7F56D9',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-[#344054]">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Skeleton loading component
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  variant = 'rectangular'
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantClasses[variant]} ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
      role="status"
      aria-label="Loading content"
    />
  );
}

// Multiple skeleton lines for text content
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '75%' : '100%'}
          variant="text"
        />
      ))}
    </div>
  );
}