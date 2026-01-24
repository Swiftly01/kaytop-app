'use client';

import { ReactNode } from 'react';

interface ModalBackdropProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  zIndex?: number;
  blurIntensity?: 'light' | 'medium' | 'heavy';
  allowBackdropClick?: boolean;
}

/**
 * Standardized Modal Backdrop Component
 * 
 * Provides consistent backdrop styling across all modals in the application.
 * Uses the design system standard: rgba(52, 64, 84, 0.7) with blur effect.
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback when backdrop is clicked (if allowBackdropClick is true)
 * @param children - Modal content to render
 * @param className - Additional CSS classes for the backdrop container
 * @param zIndex - Z-index value (defaults to 50)
 * @param blurIntensity - Blur intensity level (defaults to 'medium')
 * @param allowBackdropClick - Whether clicking backdrop closes modal (defaults to true)
 */
export default function ModalBackdrop({
  isOpen,
  onClose,
  children,
  className = '',
  zIndex = 50,
  blurIntensity = 'medium',
  allowBackdropClick = true,
}: ModalBackdropProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (allowBackdropClick && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Blur intensity mapping
  const blurStyles = {
    light: 'blur(8px)',
    medium: 'blur(16px)',
    heavy: 'blur(24px)',
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: blurStyles[blurIntensity],
        zIndex,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

/**
 * Hook for consistent modal backdrop click handling
 */
export const useModalBackdropClick = (onClose: () => void) => {
  return (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
};

/**
 * Standard modal backdrop styles as CSS-in-JS object
 * Use this for components that need inline styles
 */
export const STANDARD_MODAL_BACKDROP_STYLES = {
  backgroundColor: 'rgba(52, 64, 84, 0.7)',
  backdropFilter: 'blur(16px)',
  zIndex: 50,
} as const;

/**
 * Standard modal backdrop CSS classes
 * Use this for components that prefer Tailwind classes
 */
export const STANDARD_MODAL_BACKDROP_CLASSES = 'fixed inset-0 flex items-center justify-center' as const;
