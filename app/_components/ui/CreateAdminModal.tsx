'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/app/hooks/useToast';
import { ROLE_CONFIG, PERMISSION_CATEGORIES, UserRoleType } from '@/lib/roleConfig';
import { UserService } from '@/app/services/userService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/Select';

// Types and Interfaces
interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adminData: NewAdminData) => Promise<void>;
}

export interface NewAdminData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  role: UserRoleType;
  password: string;
  branch?: string;
  state?: string;
}

interface ValidationState {
  firstName: {
    isValid: boolean;
    error?: string;
  };
  lastName: {
    isValid: boolean;
    error?: string;
  };
  mobileNumber: {
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
  password: {
    isValid: boolean;
    error?: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  role: UserRoleType | '';
  password: string;
  branch: string;
  state: string;
}

// Role and permission configurations moved to @/lib/roleConfig.ts

export default function CreateAdminModal({ isOpen, onClose, onSave }: CreateAdminModalProps) {
  const { success, error } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // State and branch data
  const [states, setStates] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    role: '',
    password: '',
    branch: '',
    state: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    firstName: { isValid: true },
    lastName: { isValid: true },
    mobileNumber: { isValid: true },
    email: { isValid: true },
    role: { isValid: true },
    password: { isValid: true }
  });

  // Validation functions
  const validateFirstName = (name: string): { isValid: boolean; error?: string } => {
    if (!name.trim()) {
      return { isValid: false, error: 'First name is required' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, error: 'First name must be at least 2 characters long' };
    }
    if (name.trim().length > 50) {
      return { isValid: false, error: 'First name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return { isValid: false, error: 'First name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true };
  };

  const validateLastName = (name: string): { isValid: boolean; error?: string } => {
    if (!name.trim()) {
      return { isValid: false, error: 'Last name is required' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Last name must be at least 2 characters long' };
    }
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Last name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return { isValid: false, error: 'Last name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true };
  };

  const validateMobileNumber = (phone: string): { isValid: boolean; error?: string } => {
    if (!phone.trim()) {
      return { isValid: false, error: 'Mobile number is required' };
    }

    // Remove all non-digit characters except + for country code
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');

    // Allow numbers with or without country code, more flexible validation
    // Just check that it contains only digits, spaces, hyphens, parentheses, dots, and optional + at start
    if (!/^[\+]?[\d\s\-\(\)\.]+$/.test(phone.trim())) {
      return { isValid: false, error: 'Mobile number can only contain digits, spaces, hyphens, parentheses, and dots' };
    }

    // Extract just the digits to check length
    const digitsOnly = cleanPhone.replace(/[^\d]/g, '');

    if (digitsOnly.length < 7) {
      return { isValid: false, error: 'Mobile number must have at least 7 digits' };
    }

    if (digitsOnly.length > 15) {
      return { isValid: false, error: 'Mobile number cannot exceed 15 digits' };
    }

    return { isValid: true };
  };

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (!password.trim()) {
      return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
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
    const firstNameValidation = validateFirstName(formData.firstName);
    const lastNameValidation = validateLastName(formData.lastName);
    const mobileValidation = validateMobileNumber(formData.mobileNumber);
    const emailValidation = validateEmail(formData.email);
    const roleValidation = validateRole(formData.role);
    const passwordValidation = validatePassword(formData.password);

    setValidation({
      firstName: firstNameValidation,
      lastName: lastNameValidation,
      mobileNumber: mobileValidation,
      email: emailValidation,
      role: roleValidation,
      password: passwordValidation
    });

    return firstNameValidation.isValid && lastNameValidation.isValid && mobileValidation.isValid && emailValidation.isValid && roleValidation.isValid && passwordValidation.isValid;
  };

  // Check if form has changes
  const checkForChanges = () => {
    const hasChanges = formData.firstName !== '' ||
      formData.lastName !== '' ||
      formData.mobileNumber !== '' ||
      formData.email !== '' ||
      formData.role !== '' ||
      formData.password !== '' ||
      formData.branch !== '' ||
      formData.state !== '';
    setHasUnsavedChanges(hasChanges);
  };

  // Memoized calculations for performance
  const canSave = useMemo(() => {
    return validation.firstName.isValid &&
      validation.lastName.isValid &&
      validation.mobileNumber.isValid &&
      validation.email.isValid &&
      validation.role.isValid &&
      validation.password.isValid &&
      formData.firstName !== '' &&
      formData.lastName !== '' &&
      formData.mobileNumber !== '' &&
      formData.email !== '' &&
      formData.role !== '' &&
      formData.password !== '';
  }, [validation, formData]);

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Load states and branches when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          // Fetch states and branches from API endpoints
          const [apiStatesData, branchesData] = await Promise.all([
            UserService.getStates(),
            UserService.getBranches()
          ]);

          console.log(`📊 States loaded: ${apiStatesData.length}, Branches loaded: ${branchesData.length}`);

          setStates(apiStatesData);
          setBranches(branchesData);
        } catch (err) {
          console.error('Failed to load states and branches:', err);
          setStates([]);
          setBranches([]);
          error('Failed to load states and branches from server. Please try again.');
        }
      };
      loadData();
    }
  }, [isOpen, error]);

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
        backdropFilter: 'blur(16px)',
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
        className="bg-white rounded-[12px] shadow-2xl max-h-[80vh] overflow-y-auto mx-4 w-full max-w-[688px] sm:mx-0 sm:w-[688px] relative"
        style={{
          boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
          zIndex: 1001
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
            {/* First Name Input */}
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
                First Name
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, firstName: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const firstNameValidation = validateFirstName(e.target.value);
                    setValidation(prev => ({ ...prev, firstName: firstNameValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${validation.firstName.isValid
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
                placeholder="e.g. John"
                aria-invalid={!validation.firstName.isValid}
                aria-describedby={!validation.firstName.isValid ? 'firstName-error' : undefined}
              />
              {!validation.firstName.isValid && validation.firstName.error && (
                <p
                  id="firstName-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.firstName.error}
                </p>
              )}
            </div>

            {/* Last Name Input */}
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
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, lastName: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const lastNameValidation = validateLastName(e.target.value);
                    setValidation(prev => ({ ...prev, lastName: lastNameValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${validation.lastName.isValid
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
                placeholder="e.g. Doe"
                aria-invalid={!validation.lastName.isValid}
                aria-describedby={!validation.lastName.isValid ? 'lastName-error' : undefined}
              />
              {!validation.lastName.isValid && validation.lastName.error && (
                <p
                  id="lastName-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.lastName.error}
                </p>
              )}
            </div>

            {/* Mobile Number Input */}
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
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, mobileNumber: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const mobileValidation = validateMobileNumber(e.target.value);
                    setValidation(prev => ({ ...prev, mobileNumber: mobileValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${validation.mobileNumber.isValid
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
                placeholder="e.g. 08012345678"
                aria-invalid={!validation.mobileNumber.isValid}
                aria-describedby={!validation.mobileNumber.isValid ? 'mobile-error' : undefined}
              />
              {!validation.mobileNumber.isValid && validation.mobileNumber.error && (
                <p
                  id="mobile-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.mobileNumber.error}
                </p>
              )}
            </div>

            {/* Password Input */}
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
                Password
              </label>
              <p
                className="text-xs text-gray-500 mb-2"
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  color: '#667085',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Must contain at least one uppercase letter, one lowercase letter, and one number. Minimum 8 characters.
              </p>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  checkForChanges();
                  setTimeout(() => {
                    const passwordValidation = validatePassword(e.target.value);
                    setValidation(prev => ({ ...prev, password: passwordValidation }));
                  }, 300);
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${validation.password.isValid
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
                placeholder="Enter secure password"
                aria-invalid={!validation.password.isValid}
                aria-describedby={!validation.password.isValid ? 'password-error' : undefined}
              />
              {!validation.password.isValid && validation.password.error && (
                <p
                  id="password-error"
                  className="text-sm text-red-600 mt-1.5"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: '#F04438',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  {validation.password.error}
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
                className={`w-full border rounded-lg focus:outline-none transition-colors ${validation.email.isValid
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
                placeholder="e.g. john.doe@company.com"
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
                  const newRole = e.target.value as UserRoleType;
                  setFormData(prev => ({
                    ...prev,
                    role: newRole
                  }));
                  checkForChanges();
                  const roleValidation = validateRole(e.target.value);
                  setValidation(prev => ({ ...prev, role: roleValidation }));
                }}
                className={`w-full border rounded-lg focus:outline-none transition-colors ${validation.role.isValid
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
                <option value="">Select a role</option>
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

            {/* Branch Input */}
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
                Branch
              </label>
              <Select
                value={formData.branch}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, branch: value }));
                  checkForChanges();
                }}
              >
                <SelectTrigger
                  className="w-full border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7A62EB] focus:ring-2 focus:ring-[#7A62EB]/20 transition-colors"
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading branches...
                    </SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* State Input */}
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
                State
              </label>
              <Select
                value={formData.state}
                onValueChange={(value) => {
                  console.log('State selected:', value); // Debug log
                  setFormData(prev => ({ ...prev, state: value }));
                  checkForChanges();
                }}
                onOpenChange={(open) => {
                  console.log('State dropdown open:', open); // Debug log
                }}
              >
                <SelectTrigger
                  className="w-full border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7A62EB] focus:ring-2 focus:ring-[#7A62EB]/20 transition-colors"
                  style={{
                    height: '44px',
                    padding: '10px 14px',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent
                  className="z-[1100] bg-white border border-gray-200 shadow-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D0D5DD',
                    borderRadius: '8px',
                    boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)'
                  }}
                >
                  {states.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading states...
                    </SelectItem>
                  ) : (
                    states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  mobileNumber: formData.mobileNumber,
                  email: formData.email,
                  role: formData.role as UserRoleType,
                  password: formData.password,
                  branch: formData.branch || undefined,
                  state: formData.state || undefined
                };

                await onSave(adminData);
                success('Admin created successfully!');

                // Reset form
                setFormData({
                  firstName: '',
                  lastName: '',
                  mobileNumber: '',
                  email: '',
                  role: '',
                  password: '',
                  branch: '',
                  state: ''
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
