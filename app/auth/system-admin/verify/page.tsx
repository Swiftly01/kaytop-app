'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types and Interfaces
interface VerificationFormData {
  verificationCode: string;
}

interface ValidationErrors {
  verificationCode?: string;
  general?: string;
}

interface VerificationPageState {
  formData: VerificationFormData;
  errors: ValidationErrors;
  isLoading: boolean;
  canResend: boolean;
  resendCooldown: number;
  phoneNumber: string; // Masked phone number for display
}

interface VerificationRequest {
  verificationCode: string;
  sessionToken: string;
  userType: 'system-admin';
}

interface VerificationResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'system-admin';
    name: string;
  };
  error?: string;
}

export default function SecurityVerificationPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<VerificationFormData>({
    verificationCode: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneNumber] = useState('0813****979'); // Masked phone number
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Enhanced validation functions
  const validateVerificationCode = (code: string): string | undefined => {
    if (!code.trim()) {
      return 'Verification code is required';
    }
    if (!/^\d+$/.test(code.trim())) {
      return 'Please enter a valid verification code';
    }
    if (code.trim().length < 6) {
      return 'Verification code must be 6 digits';
    }
    if (code.trim().length > 6) {
      return 'Verification code must be exactly 6 digits';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const codeError = validateVerificationCode(formData.verificationCode);
    if (codeError) newErrors.verificationCode = codeError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  const handleRealTimeValidation = (code: string) => {
    if (code.length > 0) {
      const error = validateVerificationCode(code);
      if (error && error !== 'Verification code must be 6 digits' && code.length < 6) {
        // Don't show "must be 6 digits" error while user is still typing
        return;
      }
      setErrors(prev => ({ ...prev, verificationCode: error }));
    } else {
      setErrors(prev => ({ ...prev, verificationCode: undefined }));
    }
  };

  // Enhanced form handlers with security
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input - only allow digits, max 6 characters
    const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    
    // Prevent potential XSS by ensuring only numeric input
    if (sanitizedValue !== e.target.value.replace(/\D/g, '').slice(0, 6)) {
      console.warn('Invalid input detected and sanitized');
    }
    
    setFormData(prev => ({ ...prev, verificationCode: sanitizedValue }));
    
    // Real-time validation with debounce
    setTimeout(() => {
      handleRealTimeValidation(sanitizedValue);
    }, 300);
    
    // Clear general errors when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  // Security: Clear sensitive data on component unmount
  useEffect(() => {
    return () => {
      // Clear form data when component unmounts
      setFormData({ verificationCode: '' });
      setErrors({});
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is blocked due to too many attempts
    if (isBlocked) {
      setErrors({ general: 'Too many failed attempts. Please try again later.' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get session token from localStorage or sessionStorage
      const sessionToken = localStorage.getItem('verification-session-token') || 
                          sessionStorage.getItem('verification-session-token') || '';
      
      if (!sessionToken) {
        setErrors({ general: 'Session expired. Please log in again.' });
        setTimeout(() => {
          router.push('/auth/system-admin/login');
        }, 2000);
        return;
      }
      
      const response = await fetch('/api/auth/system-admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationCode: formData.verificationCode,
          sessionToken,
          userType: 'system-admin'
        } as VerificationRequest),
      });

      if (response.ok) {
        const data: VerificationResponse = await response.json();
        
        // Reset attempt count on success
        setAttemptCount(0);
        
        // Store authentication token
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
        }
        
        // Clear verification session token
        localStorage.removeItem('verification-session-token');
        sessionStorage.removeItem('verification-session-token');
        
        // Redirect to system admin dashboard
        router.push('/dashboard/system-admin');
      } else {
        const errorData = await response.json();
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        // Block user after 5 failed attempts
        if (newAttemptCount >= 5) {
          setIsBlocked(true);
          setErrors({ general: 'Too many failed attempts. Please try again later.' });
          // Auto-unblock after 15 minutes
          setTimeout(() => {
            setIsBlocked(false);
            setAttemptCount(0);
          }, 15 * 60 * 1000);
        } else {
          // Handle specific error types
          if (response.status === 400) {
            setErrors({ general: 'Invalid verification code. Please try again.' });
          } else if (response.status === 401) {
            setErrors({ general: 'Verification code has expired. Please request a new one.' });
          } else if (response.status === 429) {
            setErrors({ general: 'Too many attempts. Please wait before trying again.' });
          } else {
            setErrors({ general: errorData.message || 'Invalid verification code. Please try again.' });
          }
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrors({ general: 'Connection failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Secure resend code functionality
  const handleResendCode = async () => {
    if (!canResend || isLoading) return;

    setCanResend(false);
    setResendCooldown(60);

    try {
      // Get session token securely
      const sessionToken = localStorage.getItem('verification-session-token') || 
                          sessionStorage.getItem('verification-session-token') || '';
      
      if (!sessionToken) {
        setErrors({ general: 'Session expired. Please log in again.' });
        return;
      }

      const response = await fetch('/api/auth/system-admin/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          userType: 'system-admin'
        }),
      });

      if (response.ok) {
        // Clear any existing errors
        setErrors({});
        // Reset form
        setFormData({ verificationCode: '' });
        // Show success message (could use toast notification)
        console.log('Verification code resent successfully');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Failed to resend code. Please try again.' });
      }
    } catch (error) {
      console.error('Resend error:', error);
      setErrors({ general: 'Connection failed. Please try again.' });
    }
  };

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  // Focus management and keyboard navigation
  useEffect(() => {
    // Auto-focus on the verification code input when page loads
    const codeInput = document.getElementById('verification-code');
    if (codeInput) {
      codeInput.focus();
    }

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Submit form on Enter key when input is focused
      if (e.key === 'Enter' && document.activeElement?.id === 'verification-code') {
        e.preventDefault();
        if (!isLoading && formData.verificationCode.length === 6) {
          handleSubmit(e as any);
        }
      }
      
      // Clear errors on Escape key
      if (e.key === 'Escape') {
        setErrors({});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, formData.verificationCode]);

  // Announce status changes to screen readers
  useEffect(() => {
    const announceStatus = () => {
      const statusElement = document.getElementById('verification-status');
      if (statusElement) {
        if (isLoading) {
          statusElement.textContent = 'Verifying your code, please wait...';
        } else if (errors.general) {
          statusElement.textContent = `Error: ${errors.general}`;
        } else if (errors.verificationCode) {
          statusElement.textContent = `Input error: ${errors.verificationCode}`;
        } else {
          statusElement.textContent = '';
        }
      }
    };

    announceStatus();
  }, [isLoading, errors]);

  return (
    <div 
      className="bg-white rounded-[10px] shadow-lg mx-4 sm:mx-auto"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '609px',
        minHeight: '458.71px',
        margin: '0 auto'
      }}
    >
      {/* Form Container with responsive padding */}
      <div 
        className="p-4 sm:p-6 md:p-8"
        style={{ 
          padding: 'clamp(16px, 4vw, 32px)'
        }}
      >
        {/* Header - Exact Figma positioning */}
        <div style={{ marginBottom: '48px' }}>
          <h1 
            id="verification-heading"
            className="text-2xl sm:text-3xl"
            style={{
              position: 'relative',
              maxWidth: '100%',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: 'clamp(24px, 5vw, 32px)',
              lineHeight: '1.2',
              color: '#021C3E',
              marginBottom: '8px'
            }}
          >
            Security Verification
          </h1>
          <p 
            className="text-sm sm:text-base"
            style={{
              position: 'relative',
              maxWidth: '100%',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: 'clamp(14px, 3vw, 16px)',
              lineHeight: '1.2',
              color: '#021C3E',
              opacity: 0.5,
              marginBottom: '24px'
            }}
          >
            To secure your account please verify it's you
          </p>
          <p 
            id="verification-instructions"
            style={{
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '22px',
              display: 'flex',
              alignItems: 'flex-end',
              color: '#464A53'
            }}
            aria-live="polite"
          >
            Enter the code sent to <span aria-label="phone number ending in 979">{phoneNumber}</span>
          </p>
        </div>

        {/* Enhanced General Error Message */}
        {errors.general && (
          <div 
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm font-medium">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form with enhanced accessibility */}
        <form 
          onSubmit={handleSubmit} 
          role="form" 
          aria-labelledby="verification-heading"
          aria-describedby="verification-instructions"
        >
          {/* Verification Code Field - Exact Figma positioning */}
          <div style={{ marginBottom: '32px' }}>
            <div className="relative">
              <input
                id="verification-code"
                type="text"
                value={formData.verificationCode}
                onChange={handleInputChange}
                placeholder="Mobile verification code"
                className={`focus:outline-none transition-colors ${
                  errors.verificationCode 
                    ? 'border-red-500' 
                    : 'focus:border-blue-500'
                }`}
                style={{
                  // Figma CSS specifications
                  boxSizing: 'border-box',
                  position: 'relative',
                  width: '100%',
                  background: '#F9FAFC',
                  border: errors.verificationCode ? '2px solid #F04438' : '1px solid #BCC7D3',
                  borderRadius: '3px',
                  height: '49px',
                  padding: '16px 20px',
                  fontFamily: 'Open Sauce Sans',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '17px',
                  color: '#6A707E'
                }}
                aria-invalid={!!errors.verificationCode}
                aria-describedby={errors.verificationCode ? 'code-error' : 'code-description'}
                aria-label="Enter 6-digit verification code"
                disabled={isLoading}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
              />
              {/* Responsive styling */}
              <style jsx>{`
                input::placeholder {
                  font-family: 'Open Sauce Sans';
                  font-style: normal;
                  font-weight: 400;
                  font-size: 14px;
                  line-height: 17px;
                  color: #6A707E;
                  opacity: 0.5;
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                  input {
                    font-size: 16px !important; /* Prevent zoom on iOS */
                    height: 48px !important;
                  }
                }
                
                @media (max-width: 480px) {
                  .verification-container {
                    margin: 16px;
                    padding: 16px;
                  }
                }
                
                /* Touch targets for mobile */
                @media (hover: none) and (pointer: coarse) {
                  button {
                    min-height: 44px;
                    padding: 12px 18px;
                  }
                }
              `}</style>
            </div>
            {errors.verificationCode && (
              <p 
                id="code-error"
                className="mt-1 text-red-500 text-sm"
                role="alert"
              >
                {errors.verificationCode}
              </p>
            )}
            <div id="code-description" className="sr-only">
              Enter the 6-digit verification code sent to your mobile device.
            </div>
          </div>

          {/* Submit Button - Exact Figma specifications */}
          <button
            type="submit"
            disabled={isLoading}
            className="hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
            style={{
              // Responsive Figma CSS specifications
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 18px',
              gap: '8px',
              position: 'relative',
              width: '100%',
              maxWidth: '421px',
              minHeight: '44px',
              height: '44px',
              background: '#7F56D9', // Primary/600
              border: '1px solid #7F56D9',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)', // Shadow/xs
              borderRadius: '8px',
              // Text styling
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: 'clamp(14px, 3vw, 16px)',
              lineHeight: '24px', // 150%
              color: '#FFFFFF' // Base/White
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span 
                style={{
                  width: '53px',
                  height: '24px',
                  fontFamily: 'Open Sauce Sans',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#FFFFFF',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0
                }}
              >
                Sign in
              </span>
            )}
          </button>
        </form>

        {/* Resend Code Option with accessibility */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResendCode}
              className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 rounded-md"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '22px',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
              aria-describedby="resend-help"
              disabled={isLoading}
            >
              Didn't receive the code? Resend
            </button>
          ) : (
            <p 
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '22px',
                color: '#767D94',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              Resend code in {resendCooldown}s
            </p>
          )}
          <div id="resend-help" className="sr-only">
            Click to request a new verification code if you haven't received one
          </div>
        </div>

        {/* Screen reader status announcements */}
        <div 
          id="verification-status" 
          className="sr-only" 
          aria-live="assertive" 
          aria-atomic="true"
        ></div>

        {/* Additional accessibility information */}
        <div className="sr-only">
          <p>This page requires a 6-digit verification code sent to your mobile device.</p>
          <p>Enter the code in the input field and press Enter or click Sign in to continue.</p>
          <p>If you don't receive the code, you can request a new one using the resend option.</p>
        </div>
      </div>
    </div>
  );
}