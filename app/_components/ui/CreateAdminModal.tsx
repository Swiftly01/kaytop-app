'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/app/hooks/useToast';

// Types and Interfaces
interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adminData: NewAdminData) => Promise<void>;
}

interface NewAdminData {
  name: string;
  phoneNumber: string;
  email: string;
  role: 'HQ' | 'AM' | 'CO' | 'BM';
  permissions: string[];
}

interface ValidationState {
  name: {
    isValid: boolean;
    error?: string;
  };
  phoneNumber: {
    isValid: boolean;
    error?: string;
  };
  email: {
    isValid: boolean;
    error?: string;
  };
  role: {
    isValid: boolean;
    error?: string;
  };
}

interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  role: 'HQ' | 'AM' | 'CO' | 'BM' | '';
  permissions: string[];
}

// Role Configuration
const ROLE_CONFIG = {
  HQ: {
    label: 'Headquarters',
    color: '#AB659C',
    backgroundColor: '#FBEFF8',
    defaultPermissions: ['Dashboard', 'Payment', 'Subscription', 'Company', 'Service', 'Blacklist', 'Pricing']
  },
  AM: {
    label: 'Area Manager',
    color: '#4C5F00',
    backgroundColor: '#ECF0D9',
    defaultPermissions: ['Dashboard', 'Payment', 'Subscription', 'Company', 'Service']
  },
  CO: {
    label: 'Credit Officer',
    color: '#462ACD',
    backgroundColor: '#DEDAF3',
    defaultPermissions: ['Dashboard', 'Company', 'Service']
  },
  BM: {
    label: 'Branch Manager',
    color: '#AB659C',
    backgroundColor: '#FBEFF8',
    defaultPermissions: ['Dashboard', 'Payment', 'Subscription', 'Company', 'Service', 'Blacklist']
  }
};

// Permission Categories
const PERMISSION_CATEGORIES = {
  'Core Operations': ['Dashboard', 'Payment', 'Subscription'],
  'Management': ['Company', 'Service', 'Blacklist'],
  'Configuration': ['Pricing']
};

export default function CreateAdminModal({ isOpen, onClose, onSave }: CreateAdminModalProps) {
  const { success, error } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    email: '',
    role: '',
    permissions: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    name: { isValid: true },
    phoneNumber: { isValid: true },
    email: { isValid: true },
    role: { isValid: true }
  });

  // Validation functions
  const validateName = (name: string): { isValid: boolean; error?: string } => {
    if (!name.trim()) {
      return { isValid: false, error: 'Name is required' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters long' };
    }
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true };
  };

  const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
    if (!phone.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { isValid: false, error: 'Phone number must be between 10 and 15 digits' };
    }
    return { isValid: true };
  };

  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    if (email.trim().length > 100) {
      return { isValid: false, error: 'Email must be less than 100 characters' };
    }
    return { isValid: true };
  };

  const validateRole = (role: string): { isValid: boolean; error?: string } => {
    if (!role) {
      return { isValid: false, error: 'Role is required' };
    }
    if (!Object.keys(ROLE_CONFIG).includes(role)) {
      return { isValid: false, error: 'Please select a valid role' };
    }
    return { isValid: true };
  };

  const validateForm = (): boolean => {
    const nameValidation = validateName(formData.name);
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    const emailValidation = validateEmail(formData.email);
    const roleValidation = validateRole(formData.role);

    setValidation({
      name: nameValidation,
      phoneNumber: phoneValidation,
      email: emailValidation,
      role: roleValidation
    });

    return nameValidation.isValid && phoneValidation.isValid && emailValidation.isValid && roleValidation.isValid && formData.permissions.length > 0;
  };

  // Check if form has changes
  const checkForChanges = () => {
    const hasChanges = formData.name !== '' || 
                      formData.phoneNumber !== '' || 
                      formData.email !== '' || 
                      formData.role !== '' || 
                      formData.permissions.length > 0;
    setHasUnsavedChanges(hasChanges);
  };

  // Memoized calculations for performance
  const canSave = useMemo(() => {
    return validation.name.isValid && 
           validation.phoneNumber.isValid && 
           validation.email.isValid && 
           validation.role.isValid && 
           formData.permissions.length > 0 &&
           formData.name !== '' &&
           formData.phoneNumber !== '' &&
           formData.email !== '' &&
           formData.role !== '';
  }, [validation, formData]);

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
        if (hasUnsavedChanges) {
          const confirmClose = window.confirm(
            'You have unsaved changes. Are you sure you want to close without saving?'
          );
          if (confirmClose) {
            onClose();
          }
        } else {
          onClose();
        }
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
  }, [isOpen, hasUnsavedChanges, onClose]);

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
        if (canSave) {
          // Trigger form submission
          const submitButton = modal.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton) {
            submitButton.click();
          }
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    modal.addEventListener('keydown', handleEnterKey);

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      modal.removeEventListener('keydown', handleEnterKey);
    };
  }, [isOpen, canSave]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-0"
      style={{
        background: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(8px)',
        transition: 'all 200ms ease-in-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (hasUnsavedChanges) {
            const confirmClose = window.confirm(
              'You have unsaved changes. Are you sure you want to close without saving?'
            );
            if (confirmClose) {
              onClose();
            }
          } else {
            onClose();
          }
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-admin-modal-title"
      aria-describedby="create-admin-modal-description"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="bg-white rounded-[12px] shadow-2xl max-h-[80vh] overflow-y-auto mx-4 w-full max-w-[688px] sm:mx-0 sm:w-[688px]"
        style={{
          boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.08)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <div className="flex-1">
            <h2 
              id="create-admin-modal-title"
              className="text-lg font-semibold"
              style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '28px',
                color: '#101828',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              Create Admin
            </h2>
            <p 
              id="create-admin-modal-description"
              className="text-sm mt-1"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: '#667085',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              Tell us about your customer, it only takes a few minutes.
            </p>
          </div>

          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmClose = window.confirm(
                  'You have unsaved changes. Are you sure you want to close without saving?'
                );
                if (confirmClose) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="text-[#667085] hover:text-[#101828] transition-colors p-2 ml-4"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content - Form Fields */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Name Input */}
            <div>
              <label 
                className="block text-sm font-medium mb-1.5"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: '#344054',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Name
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const nameValidation = validateName(e.target.value);
                    setValidation(prev => ({ ...prev, name: nameValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${
                  validation.name.isValid 
                    ? 'border-[#D0D5DD] focus:border-[#7A62EB] focus:ring-2 focus:ring-[#7A62EB]/20' 
                    : 'border-[#F04438] focus:border-[#F04438] focus:ring-2 focus:ring-[#F04438]/20'
                }`}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="e.g. Linear"
                aria-invalid={!validation.name.isValid}
                aria-describedby={!validation.name.isValid ? 'name-error' : undefined}
              />
              {!validation.name.isValid && validation.name.error && (
                <p 
                  id="name-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.name.error}
                </p>
              )}
            </div>

            {/* Phone Number Input */}
            <div>
              <label 
                className="block text-sm font-medium mb-1.5"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: '#344054',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, phoneNumber: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const phoneValidation = validatePhoneNumber(e.target.value);
                    setValidation(prev => ({ ...prev, phoneNumber: phoneValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${
                  validation.phoneNumber.isValid 
                    ? 'border-[#D0D5DD] focus:border-[#7A62EB] focus:ring-2 focus:ring-[#7A62EB]/20' 
                    : 'border-[#F04438] focus:border-[#F04438] focus:ring-2 focus:ring-[#F04438]/20'
                }`}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="e.g. Linear"
                aria-invalid={!validation.phoneNumber.isValid}
                aria-describedby={!validation.phoneNumber.isValid ? 'phone-error' : undefined}
              />
              {!validation.phoneNumber.isValid && validation.phoneNumber.error && (
                <p 
                  id="phone-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.phoneNumber.error}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label 
                className="block text-sm font-medium mb-1.5"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: '#344054',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const emailValidation = validateEmail(e.target.value);
                    setValidation(prev => ({ ...prev, email: emailValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${
                  validation.email.isValid 
                    ? 'border-[#D0D5DD] focus:border-[#7A62EB] focus:ring-2 focus:ring-[#7A62EB]/20' 
                    : 'border-[#F04438] focus:border-[#F04438] focus:ring-2 focus:ring-[#F04438]/20'
                }`}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="e.g. Linear"
                aria-invalid={!validation.email.isValid}
                aria-describedby={!validation.email.isValid ? 'email-error' : undefined}
              />
              {!validation.email.isValid && validation.email.error && (
                <p 
                  id="email-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.email.error}
                </p>
              )}
            </div>

            {/* Role Selector */}
            <div>
              <label 
                className="block text-sm font-medium mb-1.5"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: '#344054',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value as 'HQ' | 'AM' | 'CO' | 'BM';
                  setFormData(prev => ({ 
                    ...prev, 
                    role: newRole,
                    permissions: newRole ? ROLE_CONFIG[newRole].defaultPermissions : []
                  }));
                  checkForChanges();
                  const roleValidation = validateRole(e.target.value);
                  setValidation(prev => ({ ...prev, role: roleValidation }));
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${
                  validation.role.isValid 
                    ? 'border-[#D0D5DD] focus:border-[#7A62EB] focus:ring-2 focus:ring-[#7A62EB]/20' 
                    : 'border-[#F04438] focus:border-[#F04438] focus:ring-2 focus:ring-[#F04438]/20'
                }`}
                style={{
                  height: '44px',
                  padding: '10px 14px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                aria-invalid={!validation.role.isValid}
                aria-describedby={!validation.role.isValid ? 'role-error' : undefined}
              >
                <option value="">e.g. Linear</option>
                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} ({key})
                  </option>
                ))}
              </select>
              {!validation.role.isValid && validation.role.error && (
                <p 
                  id="role-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.role.error}
                </p>
              )}
            </div>

            {/* Permissions Section */}
            <div>
              <fieldset>
                <legend 
                  className="block text-sm font-medium mb-3"
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '20px',
                    color: '#344054',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  Select Permissions
                </legend>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                    <div key={category} className="col-span-2">
                      <h4 
                        className="text-sm font-medium mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '20px',
                          color: '#344054',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <label key={permission} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    permissions: [...prev.permissions, permission]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(p => p !== permission)
                                  }));
                                }
                                checkForChanges();
                              }}
                              className="w-5 h-5 text-[#7A62EB] border-[#BCC7D3] rounded focus:ring-[#7A62EB] focus:ring-2"
                              style={{
                                backgroundColor: '#F9FAFC'
                              }}
                            />
                            <span 
                              className="text-sm"
                              style={{
                                fontSize: '14px',
                                fontWeight: 400,
                                lineHeight: '20px',
                                color: '#344054',
                                fontFamily: 'Open Sauce Sans, sans-serif',
                              }}
                            >
                              {permission}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {formData.permissions.length === 0 && (
                  <p 
                    className="text-sm text-red-600 mt-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      color: '#F04438',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    At least one permission must be selected
                  </p>
                )}
              </fieldset>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-[#EAECF0]">
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmClose = window.confirm(
                  'You have unsaved changes. Are you sure you want to close without saving?'
                );
                if (confirmClose) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              fontFamily: 'Open Sauce Sans, sans-serif',
              color: '#344054',
              borderColor: '#D0D5DD'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={async () => {
              if (!validateForm()) {
                error('Please fix the validation errors before saving');
                return;
              }

              setIsLoading(true);
              try {
                const adminData: NewAdminData = {
                  name: formData.name,
                  phoneNumber: formData.phoneNumber,
                  email: formData.email,
                  role: formData.role as 'HQ' | 'AM' | 'CO' | 'BM',
                  permissions: formData.permissions
                };
                
                await onSave(adminData);
                success('Admin created successfully!');
                
                // Reset form
                setFormData({
                  name: '',
                  phoneNumber: '',
                  email: '',
                  role: '',
                  permissions: []
                });
                setHasUnsavedChanges(false);
                onClose();
              } catch (err) {
                console.error('Create admin error:', err);
                error('Failed to create admin. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading || !canSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#7A62EB] border border-transparent rounded-lg hover:bg-[#6941C6] focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              'Create Admin'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}