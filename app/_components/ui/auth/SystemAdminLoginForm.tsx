'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import Link from 'next/link';

interface SignInFormData {
  email: string;
  password: string;
  keepSignedIn: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SystemAdminLoginForm() {
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    keepSignedIn: false
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use local loading state to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  const isLoading = isSubmitting || authLoading;

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  const handleRealTimeValidation = (field: keyof SignInFormData, value: string) => {
    if (value.length > 0) {
      let error: string | undefined;
      if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'password') {
        error = validatePassword(value);
      }
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Enhanced form handlers
  const handleInputChange = (field: keyof SignInFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'keepSignedIn' ? e.target.checked : e.target.value.trim();
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation with debounce for text fields
    if (field !== 'keepSignedIn') {
      setTimeout(() => {
        handleRealTimeValidation(field, value as string);
      }, 300);
    }
    
    // Clear general errors when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  // Security: Clear sensitive data on component unmount
  useEffect(() => {
    return () => {
      setFormData({ email: '', password: '', keepSignedIn: false });
      setErrors({});
    };
  }, []);

  // Focus management and keyboard navigation
  useEffect(() => {
    // Auto-focus on the email input when component loads
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
      emailInput.focus();
    }

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear errors on Escape key
      if (e.key === 'Escape') {
        setErrors({});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Announce status changes to screen readers
  useEffect(() => {
    const announceStatus = () => {
      const statusElement = document.getElementById('login-status');
      if (statusElement) {
        if (isLoading) {
          statusElement.textContent = 'Signing in, please wait...';
        } else if (errors.general) {
          statusElement.textContent = `Error: ${errors.general}`;
        } else if (errors.email) {
          statusElement.textContent = `Email error: ${errors.email}`;
        } else if (errors.password) {
          statusElement.textContent = `Password error: ${errors.password}`;
        } else {
          statusElement.textContent = '';
        }
      }
    };

    announceStatus();
  }, [isLoading, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use the exact format that works in Postman
      await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.keepSignedIn
      });
    } catch (error: any) {
      console.error('Authentication error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.type,
        details: error.details
      });
      
      // Handle specific error types
      if (error.status === 401) {
        setErrors({ general: 'Invalid email or password' });
      } else if (error.status === 429) {
        setErrors({ general: 'Too many login attempts. Please try again later.' });
      } else if (error.type === 'network') {
        setErrors({ general: 'Connection failed. Please check your internet connection and try again.' });
      } else if (error.message?.includes('No authentication token')) {
        setErrors({ general: 'Login successful but no token received. Please contact support.' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
        aria-labelledby="login-heading"
      >
        {/* Email Field - Exact Figma positioning */}
        <div style={{ marginBottom: '20px' }}>
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
              onChange={handleInputChange('email')}
              placeholder="Enter your email"
              className="focus:outline-none transition-colors"
              style={{
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
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isLoading}
              autoComplete="email"
            />
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
        </div>

        {/* Password Field - Exact Figma positioning */}
        <div style={{ marginBottom: '32px' }}>
          <label 
            htmlFor="password-input"
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
            Password
          </label>
          
          <div className="relative">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Enter your password"
              className="focus:outline-none transition-colors"
              style={{
                boxSizing: 'border-box',
                position: 'relative',
                width: '100%',
                background: '#F9FAFC',
                border: errors.password ? '2px solid #F04438' : '1px solid #BCC7D3',
                borderRadius: '3px',
                height: '49px',
                padding: '16px 20px',
                paddingRight: '50px',
                fontFamily: 'Open Sauce Sans',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '17px',
                color: '#6A707E'
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {/* Password Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {showPassword ? (
                  // Eye slash icon (hide)
                  <>
                    <path d="M9.88 9.88C9.69 10.01 9.46 10.08 9.21 10.08C8.43 10.08 7.79 9.44 7.79 8.66C7.79 8.41 7.86 8.18 7.99 7.99" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.14 6.14C5.86 6.42 5.7 6.8 5.7 7.22C5.7 8.22 6.5 9.02 7.5 9.02C7.92 9.02 8.3 8.86 8.58 8.58" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12.5C4.5 12.5 1.5 8 1.5 8S3 5.5 5.5 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.5 4.5C12 5.5 13.5 8 13.5 8S12.5 9.5 11 10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                ) : (
                  // Eye icon (show)
                  <>
                    <path d="M1 8S3 3 8 3S15 8 15 8S13 13 8 13S1 8 1 8Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                )}
              </svg>
            </button>
          </div>
          {errors.password && (
            <p 
              id="password-error"
              className="mt-1 text-red-500 text-sm"
              role="alert"
            >
              {errors.password}
            </p>
          )}
        </div>

        {/* Checkbox and Forgot Password Row */}
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div className="flex items-center gap-3">
            <Checkbox
              id="keep-signed-in"
              checked={formData.keepSignedIn}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, keepSignedIn: !!checked }))
              }
              disabled={isLoading}
              className="w-5 h-5"
            />
            <label 
              htmlFor="keep-signed-in"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '22px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans',
                cursor: 'pointer'
              }}
            >
              Keep me signed in
            </label>
          </div>
          <Link 
            href="/auth/system-admin/forgot-password"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '22px',
              color: '#7A62EB',
              fontFamily: 'Open Sauce Sans',
              textDecoration: 'none'
            }}
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:ring-offset-2 rounded"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button - Exact Figma specifications */}
        <button
          type="submit"
          disabled={isLoading}
          className="hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
          style={{
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
            background: '#7F56D9',
            border: '1px solid #7F56D9',
            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
            borderRadius: '8px',
            fontFamily: 'Open Sauce Sans',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: 'clamp(14px, 3vw, 16px)',
            lineHeight: '24px',
            color: '#FFFFFF',
            margin: '0 auto'
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <span 
              style={{
                fontFamily: 'Open Sauce Sans',
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#FFFFFF'
              }}
            >
              Sign in
            </span>
          )}
        </button>
      </form>

      {/* Screen reader status announcements */}
      <div 
        id="login-status" 
        className="sr-only" 
        aria-live="assertive" 
        aria-atomic="true"
      ></div>

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
        
        /* Touch targets for mobile */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px;
            padding: 12px 18px;
          }
        }
      `}</style>
    </>
  );
}