'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useToast } from '@/app/hooks/useToast';

// Types and Interfaces
interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GlobalSettingsData) => Promise<void>;
  initialData?: GlobalSettingsData;
}

interface GlobalSettingsData {
  interestRate: string;
  loanDuration: string;
}

interface ValidationState {
  interestRate: {
    isValid: boolean;
    error?: string;
  };
  loanDuration: {
    isValid: boolean;
    error?: string;
  };
}

export default function GlobalSettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = { interestRate: '', loanDuration: '' } 
}: GlobalSettingsModalProps) {
  const { success, error } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Form state
  const [formData, setFormData] = useState<GlobalSettingsData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    interestRate: { isValid: true },
    loanDuration: { isValid: true }
  });

  // Validation functions
  const validateInterestRate = (value: string): { isValid: boolean; error?: string } => {
    if (!value.trim()) {
      return { isValid: false, error: 'Interest rate is required' };
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Interest rate must be a valid number' };
    }
    if (numValue < 0.1 || numValue > 50) {
      return { isValid: false, error: 'Interest rate must be between 0.1% and 50%' };
    }
    return { isValid: true };
  };

  const validateLoanDuration = (value: string): { isValid: boolean; error?: string } => {
    if (!value.trim()) {
      return { isValid: false, error: 'Loan duration is required' };
    }
    const numValue = parseInt(value);
    if (isNaN(numValue) || !Number.isInteger(parseFloat(value))) {
      return { isValid: false, error: 'Loan duration must be a whole number' };
    }
    if (numValue < 1 || numValue > 360) {
      return { isValid: false, error: 'Loan duration must be between 1 and 360 months' };
    }
    return { isValid: true };
  };

  const validateForm = (): boolean => {
    const interestRateValidation = validateInterestRate(formData.interestRate);
    const loanDurationValidation = validateLoanDuration(formData.loanDuration);

    setValidation({
      interestRate: interestRateValidation,
      loanDuration: loanDurationValidation
    });

    return interestRateValidation.isValid && loanDurationValidation.isValid;
  };

  // Memoized validation functions
  const debouncedValidateInterestRate = useCallback((value: string) => {
    setTimeout(() => {
      const validation = validateInterestRate(value);
      setValidation(prev => ({ ...prev, interestRate: validation }));
    }, 300);
  }, []);

  const debouncedValidateLoanDuration = useCallback((value: string) => {
    setTimeout(() => {
      const validation = validateLoanDuration(value);
      setValidation(prev => ({ ...prev, loanDuration: validation }));
    }, 300);
  }, []);

  // Form handlers
  const handleInterestRateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, interestRate: value }));
    debouncedValidateInterestRate(value);
  }, [debouncedValidateInterestRate]);

  const handleLoanDurationChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, loanDuration: value }));
    debouncedValidateLoanDuration(value);
  }, [debouncedValidateLoanDuration]);

  const handleClose = useCallback(() => {
    setFormData(initialData);
    setValidation({
      interestRate: { isValid: true },
      loanDuration: { isValid: true }
    });
    onClose();
  }, [initialData, onClose]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      error('Please fix the validation errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      success('Global settings updated successfully!');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      error('Failed to save global settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSave, onClose, success, error]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Memoized form validation state
  const isFormValid = useMemo(() => {
    return validation.interestRate.isValid && validation.loanDuration.isValid;
  }, [validation.interestRate.isValid, validation.loanDuration.isValid]);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData && isOpen && !initializedRef.current) {
      setFormData(initialData);
      initializedRef.current = true;
    }
    
    // Reset initialization flag when modal closes
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [initialData, isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{
        background: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
        transition: 'all 200ms ease-in-out'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-settings-modal-title"
      aria-describedby="global-settings-modal-description"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="bg-white shadow-2xl max-h-[90vh] overflow-y-auto mx-4 w-full max-w-[480px]"
        style={{
          width: '480.05px',
          height: '834.33px',
          background: '#FFFFFF',
          boxShadow: '1.2px 2.08px 8px rgba(119, 119, 119, 0.1)',
          borderRadius: '8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 text-[#858D96] hover:text-[#6B7280] transition-colors"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M10 12L6 8L10 4" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span 
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '17px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Back
              </span>
            </button>
          </div>
          
          <h2 
            id="global-settings-modal-title"
            className="mb-2"
            style={{
              fontSize: '20px',
              fontWeight: 500,
              lineHeight: '32px',
              color: '#021C3E',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Global Settings
          </h2>
          <p 
            id="global-settings-modal-description"
            style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              color: '#021C3E',
              opacity: 0.5,
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Set interest rate and loan terms
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Interest Rate Input */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#01112C',
                  opacity: 0.5,
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Interest rate
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.interestRate}
                onChange={(e) => handleInterestRateChange(e.target.value)}
                className={`w-full border rounded-[3px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                  validation.interestRate.isValid 
                    ? 'border-[#BCC7D3] focus:border-[#7A62EB]' 
                    : 'border-[#F04438] border-2'
                }`}
                style={{
                  width: '359px',
                  height: '54px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  background: '#F9FAFC'
                }}
                placeholder="Enter interest rate (%)"
                aria-invalid={!validation.interestRate.isValid}
                aria-describedby={!validation.interestRate.isValid ? 'interest-rate-error' : undefined}
              />
              {!validation.interestRate.isValid && validation.interestRate.error && (
                <p 
                  id="interest-rate-error"
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    marginTop: '4px'
                  }}
                >
                  {validation.interestRate.error}
                </p>
              )}
            </div>

            {/* Loan Duration Input */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#01112C',
                  opacity: 0.5,
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Loan Duration
              </label>
              <input
                type="text"
                value={formData.loanDuration}
                onChange={(e) => handleLoanDurationChange(e.target.value)}
                className={`w-full border rounded-[3px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                  validation.loanDuration.isValid 
                    ? 'border-[#BCC7D3] focus:border-[#7A62EB]' 
                    : 'border-[#F04438] border-2'
                }`}
                style={{
                  width: '359px',
                  height: '54px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  background: '#F9FAFC'
                }}
                placeholder="Enter loan duration (months)"
                aria-invalid={!validation.loanDuration.isValid}
                aria-describedby={!validation.loanDuration.isValid ? 'loan-duration-error' : undefined}
              />
              {!validation.loanDuration.isValid && validation.loanDuration.error && (
                <p 
                  id="loan-duration-error"
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    marginTop: '4px'
                  }}
                >
                  {validation.loanDuration.error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={handleClose}
            className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none"
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '17px',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading || !isFormValid}
            className="bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 shadow-sm"
            style={{
              width: '360px',
              height: '44px',
              padding: '10px 18px',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              fontFamily: 'Open Sauce Sans, sans-serif',
              border: '1px solid #7F56D9',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              'Set'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
