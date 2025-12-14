'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types and Interfaces
interface ForgotPasswordFormData {
  email: string;
}

interface ValidationErrors {
  email?: string;
  general?: string;
}

interface ForgotPasswordPageState {
  formData: ForgotPasswordFormData;
  errors: ValidationErrors;
  isLoading: boolean;
  isSubmitted: boolean;
}

interface PasswordResetRequest {
  email: string;
  userType: 'system-admin';
}

interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Enhanced validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    if (email.trim().length > 100) {
      return 'Email must be less than 100 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  const handleRealTimeValidation = (email: string) => {
    if (email.length > 0) {
      const error = validateEmail(email);
      setErrors(prev => ({ ...prev, email: error }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  // Enhanced form handlers with security
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.trim();
    
    setFormData(prev => ({ ...prev, email: sanitizedValue }));
    
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
      setFormData({ email: '' });
      setErrors({});
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Import authService dynamically to avoid SSR issues
      const { authService } = await import('@/lib/services/auth');
      
      await authService.forgotPassword(formData.email);
      
      // Success - redirect to OTP verification page
      router.push(`/auth/system-admin/verify-otp?email=${encodeURIComponent(formData.email)}`);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific error types
      if (error.status === 404) {
        setErrors({ general: 'No account found with this email address.' });
      } else if (error.status === 429) {
        setErrors({ general: 'Too many requests. Please try again later.' });
      } else if (error.type === 'network') {
        setErrors({ general: 'Connection failed. Please check your internet connection and try again.' });
      } else {
        setErrors({ general: error.message || 'Unable to process request. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear form data
    setFormData({ email: '' });
    setErrors({});
    // Navigate back to login page
    router.push('/auth/system-admin/login');
  };

  const handleBackToLogin = () => {
    router.push('/auth/system-admin/login');
  };

  // Focus management and keyboard navigation
  useEffect(() => {
    // Auto-focus on the email input when page loads
    const emailInput = document.getElementById('email-input');
    if (emailInput && !isSubmitted) {
      emailInput.focus();
    }

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Submit form on Enter key when input is focused
      if (e.key === 'Enter' && document.activeElement?.id === 'email-input') {
        e.preventDefault();
        if (!isLoading && formData.email.length > 0) {
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
  }, [isLoading, formData.email, isSubmitted]);

  // Announce status changes to screen readers
  useEffect(() => {
    const announceStatus = () => {
      const statusElement = document.getElementById('forgot-password-status');
      if (statusElement) {
        if (isLoading) {
          statusElement.textContent = 'Processing your request, please wait...';
        } else if (errors.general) {
          statusElement.textContent = `Error: ${errors.general}`;
        } else if (errors.email) {
          statusElement.textContent = `Input error: ${errors.email}`;
        } else if (isSubmitted) {
          statusElement.textContent = 'Password reset email sent successfully';
        } else {
          statusElement.textContent = '';
        }
      }
    };

    announceStatus();
  }, [isLoading, errors, isSubmitted]);

  // Success state
  if (isSubmitted) {
    return (
      <div 
        className="bg-white rounded-[10px] shadow-lg mx-4 sm:mx-auto"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '609px',
          minHeight: '485.4px',
          margin: '0 auto'
        }}
      >
        <div 
          className="p-4 sm:p-6 md:p-8"
          style={{ 
            padding: 'clamp(16px, 4vw, 32px)'
          }}
        >
          {/* Success Header */}
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <div className="mb-4">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto">
                <circle cx="32" cy="32" r="32" fill="#10B981" fillOpacity="0.1"/>
                <circle cx="32" cy="32" r="20" fill="#10B981"/>
                <path d="M24 32L28 36L40 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily: 'Open Sauce Sans',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: 'clamp(24px, 5vw, 32px)',
                lineHeight: '1.2',
                color: '#021C3E',
                marginBottom: '16px'
              }}
            >
              Check your email
            </h1>
            <p 
              style={{
                fontFamily: 'Open Sauce Sans',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#767D94',
                marginBottom: '32px'
              }}
            >
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>

          {/* Back to Login Button */}
          <button
            onClick={handleBackToLogin}
            className="w-full hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 18px',
              gap: '8px',
              width: '100%',
              maxWidth: '421px',
              height: '44px',
              background: '#7F56D9',
              border: '1px solid #7F56D9',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
              borderRadius: '8px',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#FFFFFF',
              margin: '0 auto'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-[10px] shadow-lg mx-4 sm:mx-auto"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '609px',
        minHeight: '485.4px',
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
            id="forgot-password-heading"
            className="text-2xl sm:text-3xl"
            style={{
              position: 'relative',
              width: '288px',
              height: '32px',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: 'clamp(24px, 5vw, 32px)',
              lineHeight: '32px',
              color: '#021C3E',
              marginBottom: '45px'
            }}
          >
            Forgot password?
          </h1>
          <p 
            id="forgot-password-instructions"
            style={{
              position: 'relative',
              width: '477px',
              maxWidth: '100%',
              height: '16px',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '16px',
              color: '#021C3E',
              opacity: 0.5
            }}
            aria-live="polite"
          >
            Please enter your email, a reset OTP will be sent to you soon
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
          aria-labelledby="forgot-password-heading"
          aria-describedby="forgot-password-instructions"
        >
          {/* Email Field - Exact Figma positioning */}
          <div style={{ marginBottom: '32px' }}>
            {/* Email Label */}
            <label 
              htmlFor="email-input"
              style={{
                position: 'relative',
                display: 'block',
                fontFamily: 'Open Sauce Sans',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '22px',
                color: '#464A53',
                marginBottom: '8px'
              }}
            >
              Email
            </label>
            
            <div className="relative">
              <input
                id="email-input"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your username or email"
                className={`focus:outline-none transition-colors ${
                  errors.email 
                    ? 'border-red-500' 
                    : 'focus:border-blue-500'
                }`}
                style={{
                  // Figma CSS specifications
                  boxSizing: 'border-box',
                  position: 'relative',
                  width: '100%',
                  background: '#F9FAFC',
                  border: errors.email ? '2px solid #F04438' : '1px solid #BCC7D3',
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
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : 'email-description'}
                aria-label="Enter your email address"
                disabled={isLoading}
                autoComplete="email"
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
                  .forgot-password-container {
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
            {errors.email && (
              <p 
                id="email-error"
                className="mt-1 text-red-500 text-sm"
                role="alert"
              >
                {errors.email}
              </p>
            )}
            <div id="email-description" className="sr-only">
              Enter your email address to receive a password reset link.
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
              color: '#FFFFFF', // Base/White
              margin: '0 auto',
              marginBottom: '16px'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <span 
                style={{
                  width: '56px',
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
                Submit
              </span>
            )}
          </button>
        </form>

        {/* Cancel Button with accessibility */}
        <div className="text-center">
          <button
            onClick={handleCancel}
            className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 rounded-md"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '15px 20px',
              gap: '10px',
              width: '100%',
              maxWidth: '421px',
              height: '54px',
              borderRadius: '3px',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '19px',
              lineHeight: '24px',
              color: '#7A62EB',
              background: 'transparent',
              border: 'none',
              margin: '0 auto'
            }}
            aria-describedby="cancel-help"
            disabled={isLoading}
          >
            Cancel
          </button>
          <div id="cancel-help" className="sr-only">
            Click to return to the login page without sending a password reset email
          </div>
        </div>

        {/* Screen reader status announcements */}
        <div 
          id="forgot-password-status" 
          className="sr-only" 
          aria-live="assertive" 
          aria-atomic="true"
        ></div>

        {/* Additional accessibility information */}
        <div className="sr-only">
          <p>This page allows you to request a password reset email.</p>
          <p>Enter your email address and click Submit to receive reset instructions.</p>
          <p>If you remember your password, click Cancel to return to the login page.</p>
        </div>
      </div>
    </div>
  );
}