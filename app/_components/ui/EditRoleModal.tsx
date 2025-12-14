'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/app/hooks/useToast';

// Types and Interfaces
interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserData) => Promise<void>;
  userData: UserData;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'HQ' | 'AM' | 'CO' | 'BM';
  permissions: string[];
  avatar?: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}

interface ValidationState {
  name: {
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

// Role Configuration
const ROLE_CONFIG = {
  HQ: {
    label: 'Headquarters',
    color: '#AB659C',
    backgroundColor: '#FBEFF8',
    defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics']
  },
  AM: {
    label: 'Area Manager',
    color: '#4C5F00',
    backgroundColor: '#ECF0D9',
    defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Branch Management']
  },
  CO: {
    label: 'Credit Officer',
    color: '#462ACD',
    backgroundColor: '#DEDAF3',
    defaultPermissions: ['Services', 'Clients', 'Loan Processing']
  },
  BM: {
    label: 'Branch Manager',
    color: '#AB659C',
    backgroundColor: '#FBEFF8',
    defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Staff Management']
  }
};

// Permission Categories
const PERMISSION_CATEGORIES = {
  'Core Services': ['Services', 'Clients', 'Subscriptions'],
  'Financial': ['Loan Processing', 'Payment Management', 'Financial Reports'],
  'Management': ['Staff Management', 'Branch Management', 'User Administration'],
  'Analytics': ['Reports', 'Analytics', 'Data Export']
};
export default function EditRoleModal({ isOpen, onClose, onSave, userData }: EditRoleModalProps) {
  const { success, error } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<UserData>(userData);
  const [originalData] = useState<UserData>(userData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    name: { isValid: true },
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
    const emailValidation = validateEmail(formData.email);
    const roleValidation = validateRole(formData.role);

    setValidation({
      name: nameValidation,
      email: emailValidation,
      role: roleValidation
    });

    return nameValidation.isValid && emailValidation.isValid && roleValidation.isValid;
  };
  // Memoized calculations for performance
  const hasChanges = useMemo(() => {
    return (
      formData.name !== originalData.name ||
      formData.email !== originalData.email ||
      formData.role !== originalData.role ||
      JSON.stringify(formData.permissions.sort()) !== JSON.stringify(originalData.permissions.sort())
    );
  }, [formData, originalData]);

  const canSave = useMemo(() => {
    return hasChanges && validation.name.isValid && validation.email.isValid && validation.role.isValid;
  }, [hasChanges, validation]);

  // Form handlers
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    setTimeout(() => {
      const nameValidation = validateName(value);
      setValidation(prev => ({ ...prev, name: nameValidation }));
    }, 300);
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setTimeout(() => {
      const emailValidation = validateEmail(value);
      setValidation(prev => ({ ...prev, email: emailValidation }));
    }, 300);
  };

  const handleRoleChange = (value: string) => {
    const newRole = value as 'HQ' | 'AM' | 'CO' | 'BM';
    setFormData(prev => ({ 
      ...prev, 
      role: newRole,
      permissions: ROLE_CONFIG[newRole].defaultPermissions
    }));
    
    const roleValidation = validateRole(value);
    setValidation(prev => ({ ...prev, role: roleValidation }));
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return;
      }
    }

    setFormData(originalData);
    setValidation({
      name: { isValid: true },
      email: { isValid: true },
      role: { isValid: true }
    });
    onClose();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      error('Please fix the validation errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      success('User information updated successfully!');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      error('Failed to save user information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };
  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);

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
        if (canSave) {
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
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-role-modal-title"
      aria-describedby="edit-role-modal-description"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="bg-white rounded-[12px] shadow-2xl max-h-[80vh] overflow-y-auto mx-4 w-full max-w-[600px] sm:mx-0 sm:w-[600px]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#DDDFE1]">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleClose}
              className="flex items-center gap-1 sm:gap-2 text-[#767D94] hover:text-[#021C3E] transition-colors"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M10 12L6 8L10 4" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span 
                className="hidden sm:inline"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '16px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Back
              </span>
            </button>
          </div>

          <div className="text-center flex-1 px-2">
            <h2 
              id="edit-role-modal-title"
              className="text-lg sm:text-2xl"
              style={{
                fontWeight: 700,
                lineHeight: '1.2',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              Edit User Role
            </h2>
            <p 
              id="edit-role-modal-description"
              className="text-xs sm:text-sm mt-1"
              style={{
                fontWeight: 400,
                color: '#767D94',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              Modify user information and permissions
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-[#767D94] hover:text-[#021C3E] transition-colors p-1 sm:p-2"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M15 5L5 15M5 5L15 15" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* Modal Content */}
        <div className="p-4 sm:p-6">
          {/* User Avatar Section */}
          <div className="flex items-center gap-4 mb-8">
            <div 
              className="flex items-center justify-center rounded-full"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: userData.avatar ? 'transparent' : '#237385',
                backgroundImage: userData.avatar ? `url(${userData.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontSize: '20px',
                fontWeight: 500,
                color: '#FFFFFF',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {!userData.avatar && userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                {userData.name}
              </h3>
              <p 
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  color: '#767D94',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                {userData.email}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label 
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '16px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Name
                {formData.name !== originalData.name && (
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#F79009',
                      marginLeft: '8px'
                    }}
                  >
                    (Modified)
                  </span>
                )}
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full border rounded-[8px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                  validation.name.isValid 
                    ? 'border-[#DDDFE1] focus:border-[#7A62EB] focus:border-2' 
                    : 'border-[#F04438] border-2'
                }`}
                style={{
                  height: '48px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="Enter user name"
                aria-invalid={!validation.name.isValid}
                aria-describedby={!validation.name.isValid ? 'name-error' : 'name-description'}
                aria-label="User full name"
                autoComplete="name"
              />
              {!validation.name.isValid && validation.name.error && (
                <p 
                  id="name-error"
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    marginTop: '4px'
                  }}
                >
                  {validation.name.error}
                </p>
              )}
              <div id="name-description" className="sr-only">
                Enter the user's full name. Must be between 2 and 50 characters.
              </div>
            </div>
            {/* Email Input */}
            <div>
              <label 
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '16px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Email
                {formData.email !== originalData.email && (
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#F79009',
                      marginLeft: '8px'
                    }}
                  >
                    (Modified)
                  </span>
                )}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full border rounded-[8px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                  validation.email.isValid 
                    ? 'border-[#DDDFE1] focus:border-[#7A62EB] focus:border-2' 
                    : 'border-[#F04438] border-2'
                }`}
                style={{
                  height: '48px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="Enter email address"
                aria-invalid={!validation.email.isValid}
                aria-describedby={!validation.email.isValid ? 'email-error' : 'email-description'}
                aria-label="User email address"
                autoComplete="email"
              />
              {!validation.email.isValid && validation.email.error && (
                <p 
                  id="email-error"
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    marginTop: '4px'
                  }}
                >
                  {validation.email.error}
                </p>
              )}
              <div id="email-description" className="sr-only">
                Enter a valid email address for the user.
              </div>
            </div>
            {/* Role Selector */}
            <div>
              <label 
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '16px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Role
                {formData.role !== originalData.role && (
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#F79009',
                      marginLeft: '8px'
                    }}
                  >
                    (Modified)
                  </span>
                )}
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={`w-full border rounded-[8px] focus:outline-none transition-colors focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 ${
                  validation.role.isValid 
                    ? 'border-[#DDDFE1] focus:border-[#7A62EB] focus:border-2' 
                    : 'border-[#F04438] border-2'
                }`}
                style={{
                  height: '48px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#FFFFFF'
                }}
                aria-invalid={!validation.role.isValid}
                aria-describedby={!validation.role.isValid ? 'role-error' : 'role-description'}
                aria-label="Select user role"
              >
                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} ({key})
                  </option>
                ))}
              </select>
              {!validation.role.isValid && validation.role.error && (
                <p 
                  id="role-error"
                  style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    marginTop: '4px'
                  }}
                >
                  {validation.role.error}
                </p>
              )}
              <div id="role-description" className="sr-only">
                Select the user's role. This will automatically update their permissions.
              </div>
            </div>

            {/* Role Badge Preview */}
            <div>
              <label 
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '16px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Role Badge Preview
              </label>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    padding: '4px 8px',
                    backgroundColor: ROLE_CONFIG[formData.role].backgroundColor,
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '16px',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                      color: ROLE_CONFIG[formData.role].color,
                    }}
                  >
                    {formData.role}
                  </span>
                </div>
                <span 
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    color: '#767D94',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {ROLE_CONFIG[formData.role].label}
                </span>
              </div>
            </div>
            {/* Permissions Checkboxes */}
            <div>
              <fieldset>
                <legend 
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '16px',
                    color: '#021C3E',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    marginBottom: '12px'
                  }}
                >
                  Permissions
                  {JSON.stringify(formData.permissions.sort()) !== JSON.stringify(originalData.permissions.sort()) && (
                    <span 
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#F79009',
                        marginLeft: '8px'
                      }}
                    >
                      (Modified)
                    </span>
                  )}
                </legend>
                <div className="space-y-4">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                    <div key={category}>
                      <h4 
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          lineHeight: '16px',
                          color: '#021C3E',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                          marginBottom: '8px'
                        }}
                      >
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <label key={permission} className="flex items-center gap-3 cursor-pointer py-1 touch-manipulation">
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
                              }}
                              className="w-4 h-4 text-[#7A62EB] border-[#DDDFE1] rounded focus:ring-[#7A62EB] focus:ring-2"
                            />
                            <span 
                              style={{
                                fontSize: '14px',
                                fontWeight: 400,
                                lineHeight: '16px',
                                color: '#021C3E',
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
              </fieldset>
              
              <div 
                aria-live="polite" 
                aria-atomic="true" 
                className="sr-only"
                id="permissions-status"
              >
                {formData.permissions.length} permissions selected
              </div>
            </div>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t border-[#DDDFE1]">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 rounded-md px-4 py-3 sm:py-2 border border-[#7A62EB] sm:border-none"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading || !canSave}
            className="w-full sm:w-auto bg-[#7A62EB] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 shadow-sm"
            style={{
              height: '48px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '20px',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}