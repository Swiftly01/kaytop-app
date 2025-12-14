'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/app/hooks/useToast';

// Types and Interfaces
interface ReportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReportTemplateData) => Promise<void>;
  initialData?: ReportTemplateData;
}

interface ReportTemplateData {
  thingsToReport: {
    collections: boolean;
    savings: boolean;
    customers: boolean;
    missedPayments: boolean;
  };
  newParameter: string;
}

export default function ReportTemplateModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = { 
    thingsToReport: {
      collections: false,
      savings: false,
      customers: false,
      missedPayments: false
    },
    newParameter: ''
  } 
}: ReportTemplateModalProps) {
  const { success, error } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstCheckboxRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ReportTemplateData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Form handlers
  const handleCheckboxChange = useCallback((field: keyof ReportTemplateData['thingsToReport']) => {
    setFormData(prev => ({
      ...prev,
      thingsToReport: {
        ...prev.thingsToReport,
        [field]: !prev.thingsToReport[field]
      }
    }));
  }, []);

  const handleParameterChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, newParameter: value }));
  }, []);

  const handleClose = useCallback(() => {
    setFormData(initialData);
    onClose();
  }, [initialData, onClose]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      success('Report template updated successfully!');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      error('Failed to save report template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSave, onClose, success, error]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Focus management
  useEffect(() => {
    if (isOpen && firstCheckboxRef.current) {
      setTimeout(() => {
        firstCheckboxRef.current?.focus();
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
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{
        background: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(8px)',
        transition: 'all 200ms ease-in-out'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-template-modal-title"
      aria-describedby="report-template-modal-description"
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
            id="report-template-modal-title"
            className="mb-2"
            style={{
              fontSize: '20px',
              fontWeight: 500,
              lineHeight: '32px',
              color: '#021C3E',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Report Template
          </h2>
          <p 
            id="report-template-modal-description"
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
            {/* Things to Report Section */}
            <div>
              <h3 
                className="mb-5"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#01112C',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Things to report
              </h3>

              {/* Checkboxes Grid */}
              <div className="space-y-5">
                {/* First Row */}
                <div className="flex justify-between items-center" style={{ gap: '40px' }}>
                  {/* Collections */}
                  <div className="flex items-center gap-2.5">
                    <input
                      ref={firstCheckboxRef}
                      type="checkbox"
                      checked={formData.thingsToReport.collections}
                      onChange={() => handleCheckboxChange('collections')}
                      className="w-5 h-5 rounded-sm border border-[#BCC7D3] bg-[#F9FAFC] focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                      style={{
                        width: '20px',
                        height: '20px',
                        background: '#F9FAFC',
                        border: '1px solid #BCC7D3',
                        borderRadius: '3px'
                      }}
                      aria-label="Include collections in report"
                    />
                    <label 
                      className="cursor-pointer"
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '22px',
                        color: '#01112C',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                        width: '100px'
                      }}
                    >
                      Collections
                    </label>
                  </div>

                  {/* Savings */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={formData.thingsToReport.savings}
                      onChange={() => handleCheckboxChange('savings')}
                      className="w-5 h-5 rounded-sm border border-[#BCC7D3] bg-[#F9FAFC] focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                      style={{
                        width: '20px',
                        height: '20px',
                        background: '#F9FAFC',
                        border: '1px solid #BCC7D3',
                        borderRadius: '3px'
                      }}
                      aria-label="Include savings in report"
                    />
                    <label 
                      className="cursor-pointer"
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '22px',
                        color: '#01112C',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                        width: '100px'
                      }}
                    >
                      Savings
                    </label>
                  </div>

                  {/* Customers */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={formData.thingsToReport.customers}
                      onChange={() => handleCheckboxChange('customers')}
                      className="w-5 h-5 rounded-sm border border-[#BCC7D3] bg-[#F9FAFC] focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                      style={{
                        width: '20px',
                        height: '20px',
                        background: '#F9FAFC',
                        border: '1px solid #BCC7D3',
                        borderRadius: '3px'
                      }}
                      aria-label="Include customers in report"
                    />
                    <label 
                      className="cursor-pointer"
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '22px',
                        color: '#01112C',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                        width: '100px'
                      }}
                    >
                      Customers
                    </label>
                  </div>
                </div>

                {/* Second Row */}
                <div className="flex items-center gap-2.5" style={{ width: '150px' }}>
                  <input
                    type="checkbox"
                    checked={formData.thingsToReport.missedPayments}
                    onChange={() => handleCheckboxChange('missedPayments')}
                    className="w-5 h-5 rounded-sm border border-[#BCC7D3] bg-[#F9FAFC] focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
                    style={{
                      width: '20px',
                      height: '20px',
                      background: '#F9FAFC',
                      border: '1px solid #BCC7D3',
                      borderRadius: '3px'
                    }}
                    aria-label="Include missed payments in report"
                  />
                  <label 
                    className="cursor-pointer"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                      width: '120px'
                    }}
                  >
                    Missed Payments
                  </label>
                </div>
              </div>
            </div>

            {/* Add New Parameter Section */}
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
                Add new parameter
              </label>
              <input
                type="text"
                value={formData.newParameter}
                onChange={(e) => handleParameterChange(e.target.value)}
                className="w-full border rounded-[3px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 border-[#BCC7D3] focus:border-[#7A62EB]"
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
                placeholder="Enter new parameter"
              />
            </div>

            {/* Divider Line */}
            <div 
              style={{
                width: '359px',
                height: '1px',
                background: '#C4C4C4',
              }}
            />
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
            disabled={isLoading}
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