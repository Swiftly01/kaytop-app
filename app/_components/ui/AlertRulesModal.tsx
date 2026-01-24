'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/app/hooks/useToast';

// Types and Interfaces
interface AlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alertData: AlertRulesData) => Promise<void>;
  alertData: AlertRulesData;
}

interface AlertRulesData {
  missedPayments: boolean;
  missedReports: boolean;
  dailyEmailSummary: boolean;
  customParameters: string[];
}

interface ValidationState {
  newParameter: {
    isValid: boolean;
    error?: string;
  };
}

export default function AlertRulesModal({ isOpen, onClose, onSave, alertData }: AlertRulesModalProps) {
  const { success, error } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<AlertRulesData>(alertData);
  const [originalData] = useState<AlertRulesData>(alertData);
  const [newParameter, setNewParameter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    newParameter: { isValid: true }
  });

  // Validation functions
  const validateParameter = (parameter: string): { isValid: boolean; error?: string } => {
    if (!parameter.trim()) {
      return { isValid: false, error: 'Parameter name is required' };
    }
    if (parameter.trim().length < 2) {
      return { isValid: false, error: 'Parameter name must be at least 2 characters long' };
    }
    if (parameter.trim().length > 50) {
      return { isValid: false, error: 'Parameter name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(parameter.trim())) {
      return { isValid: false, error: 'Parameter name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    if (formData.customParameters.includes(parameter.trim())) {
      return { isValid: false, error: 'Parameter name already exists' };
    }
    return { isValid: true };
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.missedPayments !== originalData.missedPayments ||
      formData.missedReports !== originalData.missedReports ||
      formData.dailyEmailSummary !== originalData.dailyEmailSummary ||
      JSON.stringify(formData.customParameters.sort()) !== JSON.stringify(originalData.customParameters.sort()) ||
      newParameter.trim() !== ''
    );
  };

  const canSave = hasChanges() && validation.newParameter.isValid;

  // Form handlers
  const handleCheckboxChange = (field: keyof Omit<AlertRulesData, 'customParameters'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleParameterChange = (value: string) => {
    setNewParameter(value);
    const parameterValidation = validateParameter(value);
    setValidation(prev => ({ ...prev, newParameter: parameterValidation }));
  };

  const handleAddParameter = () => {
    if (newParameter.trim() && validation.newParameter.isValid) {
      setFormData(prev => ({
        ...prev,
        customParameters: [...prev.customParameters, newParameter.trim()]
      }));
      setNewParameter('');
      setValidation(prev => ({ ...prev, newParameter: { isValid: true } }));
    }
  };

  const handleClose = () => {
    if (hasChanges()) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }

    setFormData(originalData);
    setNewParameter('');
    setValidation({
      newParameter: { isValid: true }
    });
    onClose();
  };

  const handleSave = async () => {
    // Add current parameter if valid
    let finalData = { ...formData };
    if (newParameter.trim() && validation.newParameter.isValid) {
      finalData.customParameters = [...finalData.customParameters, newParameter.trim()];
    }

    setIsLoading(true);
    try {
      await onSave(finalData);
      success('Alert rules updated successfully!');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      error('Failed to save alert rules. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  // Initialize form data when alertData changes
  useEffect(() => {
    if (alertData) {
      setFormData(alertData);
    }
  }, [alertData]);

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

  // Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
        e.preventDefault();
        if (newParameter.trim() && validation.newParameter.isValid) {
          handleAddParameter();
        } else if (canSave) {
          handleSave();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    modal.addEventListener('keydown', handleEnterKey);

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      modal.removeEventListener('keydown', handleEnterKey);
    };
  }, [isOpen, canSave, newParameter, validation.newParameter.isValid]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-0"
      style={{
        background: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
        transition: 'all 200ms ease-in-out'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-rules-modal-title"
      aria-describedby="alert-rules-modal-description"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="bg-white rounded-[12px] shadow-2xl max-h-[80vh] overflow-y-auto mx-4 w-full max-w-[480px] sm:mx-0 sm:w-[480px]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDDFE1]">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-[#858D96] hover:text-[#021C3E] transition-colors"
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

        {/* Modal Content */}
        <div className="p-8">
          {/* Title and Description */}
          <div className="mb-8">
            <h2 
              id="alert-rules-modal-title"
              style={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '32px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '8px'
              }}
            >
              Alert rules
            </h2>
            <p 
              id="alert-rules-modal-description"
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

          {/* Divider */}
          <div 
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#C4C4C4',
              marginBottom: '32px'
            }}
          />

          {/* Alert Checkboxes */}
          <div className="space-y-5 mb-8">
            {/* Missed Payments */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                ref={firstInputRef}
                type="checkbox"
                checked={formData.missedPayments}
                onChange={() => handleCheckboxChange('missedPayments')}
                className="w-5 h-5 text-[#7A62EB] border-[#BCC7D3] rounded-[3px] focus:ring-[#7A62EB] focus:ring-2"
                style={{
                  backgroundColor: '#F9FAFC'
                }}
              />
              <span 
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#01112C',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Missed Payments
              </span>
            </label>

            {/* Missed Reports */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.missedReports}
                onChange={() => handleCheckboxChange('missedReports')}
                className="w-5 h-5 text-[#7A62EB] border-[#BCC7D3] rounded-[3px] focus:ring-[#7A62EB] focus:ring-2"
                style={{
                  backgroundColor: '#F9FAFC'
                }}
              />
              <span 
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#01112C',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Missed Reports
              </span>
            </label>

            {/* Daily Email Summary */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.dailyEmailSummary}
                onChange={() => handleCheckboxChange('dailyEmailSummary')}
                className="w-5 h-5 text-[#7A62EB] border-[#BCC7D3] rounded-[3px] focus:ring-[#7A62EB] focus:ring-2"
                style={{
                  backgroundColor: '#F9FAFC'
                }}
              />
              <span 
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#01112C',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Daily Email summary
              </span>
            </label>
          </div>

          {/* Custom Parameters Section */}
          <div>
            <label 
              htmlFor="new-parameter"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '22px',
                color: '#01112C',
                opacity: 0.5,
                fontFamily: 'Open Sauce Sans, sans-serif',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Add new alert parameter
            </label>
            <input
              id="new-parameter"
              type="text"
              value={newParameter}
              onChange={(e) => handleParameterChange(e.target.value)}
              className={`w-full border rounded-[3px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                validation.newParameter.isValid 
                  ? 'border-[#BCC7D3] focus:border-[#7A62EB]' 
                  : 'border-[#F04438] border-2'
              }`}
              style={{
                height: '54px',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                fontFamily: 'Open Sauce Sans, sans-serif',
                backgroundColor: '#F9FAFC'
              }}
              placeholder="Enter parameter name"
              aria-invalid={!validation.newParameter.isValid}
              aria-describedby={!validation.newParameter.isValid ? 'parameter-error' : 'parameter-description'}
            />
            {!validation.newParameter.isValid && validation.newParameter.error && (
              <p 
                id="parameter-error"
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  color: '#F04438',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  marginTop: '4px'
                }}
              >
                {validation.newParameter.error}
              </p>
            )}
            <div id="parameter-description" className="sr-only">
              Enter a custom alert parameter name. Must be between 2 and 50 characters.
            </div>
          </div>

          {/* Custom Parameters List */}
          {formData.customParameters.length > 0 && (
            <div className="mt-6">
              <h4 
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '16px',
                  color: '#01112C',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  marginBottom: '12px'
                }}
              >
                Custom Parameters
              </h4>
              <div className="space-y-2">
                {formData.customParameters.map((param, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span 
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        color: '#01112C',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                    >
                      {param}
                    </span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          customParameters: prev.customParameters.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label={`Remove ${param} parameter`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path 
                          d="M12 4L4 12M4 4L12 12" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-8 pt-0">
          <button
            onClick={handleClose}
            className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 rounded-md px-4 py-2"
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
            disabled={isLoading || !canSave}
            className="bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 shadow-sm"
            style={{
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
