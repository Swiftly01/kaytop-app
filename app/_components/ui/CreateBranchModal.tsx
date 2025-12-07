'use client';

import React, { useState, useEffect } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BranchFormData) => void;
}

interface BranchFormData {
  branchName: string;
  stateRegion: string;
  assignUsers: string[];
}

interface FormErrors {
  branchName?: string;
  stateRegion?: string;
  assignUsers?: string;
}

export default function CreateBranchModal({ isOpen, onClose, onSubmit }: CreateBranchModalProps) {
  const [formData, setFormData] = useState<BranchFormData>({
    branchName: '',
    stateRegion: '',
    assignUsers: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sample users data
  const availableUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: '4', name: 'Sarah Williams', email: 'sarah@example.com' },
    { id: '5', name: 'David Brown', email: 'david@example.com' },
    { id: '6', name: 'Emily Davis', email: 'emily@example.com' },
    { id: '7', name: 'Chris Wilson', email: 'chris@example.com' },
    { id: '8', name: 'Lisa Anderson', email: 'lisa@example.com' },
  ];

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        branchName: '',
        stateRegion: '',
        assignUsers: [],
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  // Validation function
  const validateField = (name: keyof BranchFormData, value: string): string | undefined => {
    switch (name) {
      case 'branchName':
        if (!value.trim()) {
          return 'Branch name is required';
        }
        if (value.trim().length < 2) {
          return 'Branch name must be at least 2 characters';
        }
        if (value.trim().length > 100) {
          return 'Branch name must not exceed 100 characters';
        }
        break;
      case 'stateRegion':
        if (!value.trim()) {
          return 'State/Region is required';
        }
        if (value.trim().length < 2) {
          return 'State/Region must be at least 2 characters';
        }
        break;
      case 'assignUsers':
        // Optional field, no validation needed
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    (Object.keys(formData) as Array<keyof BranchFormData>).forEach((key) => {
      const value = formData[key];
      // Only validate string fields
      if (typeof value === 'string') {
        const error = validateField(key, value);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur
  const handleBlur = (field: keyof BranchFormData) => {
    setTouched({ ...touched, [field]: true });
    const value = formData[field];
    // Only validate string fields
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  // Handle field change
  const handleChange = (field: keyof BranchFormData, value: string | string[]) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing (only for string fields)
    if (touched[field] && typeof value === 'string') {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      branchName: true,
      stateRegion: true,
      assignUsers: true,
    });

    // Validate form
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  // Check if form is valid
  const isFormValid = formData.branchName.trim() && formData.stateRegion.trim() && Object.keys(errors).filter(k => errors[k as keyof FormErrors]).length === 0;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-[12px] w-[688px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-[#EAECF0]">
          <div className="pr-10">
            <h2 className="text-[18px] font-semibold leading-[28px] text-[#101828] mb-1">
              Add New Branch
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Tell us about your customer. It only takes a few minutes.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-5 pb-8 space-y-4">
            {/* Branch Name Field */}
            <div className="flex items-start gap-8">
              <label className="w-[160px] text-[14px] font-medium leading-[20px] pt-[10px]" style={{ color: 'var(--color-text-medium)' }}>
                Branch Name <span style={{ color: 'var(--color-error-500)' }}>*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => handleChange('branchName', e.target.value)}
                  onBlur={() => handleBlur('branchName')}
                  placeholder="e.g. Linear"
                  className={`w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 transition-all ${
                    touched.branchName && errors.branchName
                      ? 'border-[#E43535] focus:ring-[#E43535] focus:border-[#E43535]'
                      : 'border-[#D0D5DD] focus:ring-[#7F56D9] focus:border-[#7F56D9]'
                  }`}
                  aria-invalid={touched.branchName && !!errors.branchName}
                  aria-describedby={touched.branchName && errors.branchName ? 'branchName-error' : undefined}
                />
                {touched.branchName && errors.branchName && (
                  <p id="branchName-error" className="mt-1 text-[14px] text-[#E43535]">
                    {errors.branchName}
                  </p>
                )}
              </div>
            </div>

            {/* State/Region Field */}
            <div className="flex items-start gap-8">
              <label className="w-[160px] text-[14px] font-medium leading-[20px] pt-[10px]" style={{ color: 'var(--color-text-medium)' }}>
                State/Region <span style={{ color: 'var(--color-error-500)' }}>*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.stateRegion}
                  onChange={(e) => handleChange('stateRegion', e.target.value)}
                  onBlur={() => handleBlur('stateRegion')}
                  placeholder="e.g. Lagos State"
                  className={`w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 transition-all ${
                    touched.stateRegion && errors.stateRegion
                      ? 'border-[#E43535] focus:ring-[#E43535] focus:border-[#E43535]'
                      : 'border-[#D0D5DD] focus:ring-[#7F56D9] focus:border-[#7F56D9]'
                  }`}
                  aria-invalid={touched.stateRegion && !!errors.stateRegion}
                  aria-describedby={touched.stateRegion && errors.stateRegion ? 'stateRegion-error' : undefined}
                />
                {touched.stateRegion && errors.stateRegion && (
                  <p id="stateRegion-error" className="mt-1 text-[14px] text-[#E43535]">
                    {errors.stateRegion}
                  </p>
                )}
              </div>
            </div>

            {/* Assign Users Field */}
            <div className="flex items-start gap-8">
              <label className="w-[160px] text-[14px] font-medium leading-[20px] pt-[10px]" style={{ color: 'var(--color-text-medium)' }}>
                Assign Users
              </label>
              <div className="flex-1">
                <MultiSelectDropdown
                  options={availableUsers}
                  selectedIds={formData.assignUsers}
                  onChange={(selectedIds) => setFormData({ ...formData, assignUsers: selectedIds })}
                  placeholder="Select users to assign..."
                  searchPlaceholder="Search users..."
                />
                <p className="mt-1 text-xs text-[#667085]">
                  Select one or more users to assign to this branch
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 pt-8 border-t border-[#EAECF0]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] bg-white rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors duration-200"
                style={{ 
                  color: 'var(--color-text-medium)',
                  border: '1px solid var(--color-border-gray-300)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] transition-colors duration-200"
                style={{
                  backgroundColor: isFormValid ? 'var(--color-primary-600)' : 'var(--color-border-gray-300)',
                  border: isFormValid ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border-gray-300)',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  opacity: isFormValid ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (isFormValid) e.currentTarget.style.backgroundColor = '#6941C6';
                }}
                onMouseLeave={(e) => {
                  if (isFormValid) e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                }}
              >
                Create Branch
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
