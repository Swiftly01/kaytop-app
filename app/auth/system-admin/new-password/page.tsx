'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Types and Interfaces
interface NewPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  // Form state
  const [formData, setFormData] = useState<NewPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/auth/system-admin/forgot-password');
    }
  }, [email, router]);

  // Enhanced validation functions
  const validatePassword = (password: string): string | undefined => {
    if (!password.trim()) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, newPassword: string): string | undefined => {
    if (!confirmPassword.trim()) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== newPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.newPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleInputChange = (field: keyof NewPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general errors when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
      
      await authService.resetPassword({
        email: email || '',
        otp: '', // OTP was already verified in previous step
        newPassword: formData.newPassword
      });
      
      // Success - redirect to login with success message
      router.push('/auth/system-admin/login?message=password-reset-success');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.status === 400) {
        setErrors({ general: 'Invalid or expired reset session. Please request a new password reset.' });
      } else if (error.status === 422) {
        setErrors({ general: 'Password does not meet security requirements.' });
      } else if (error.type === 'network') {
        setErrors({ general: 'Connection failed. Please check your internet connection and try again.' });
      } else {
        setErrors({ general: error.message || 'Unable to reset password. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Security: Clear sensitive data on component unmount
  useEffect(() => {
    return () => {
      setFormData({ newPassword: '', confirmPassword: '' });
      setErrors({});
    };
  }, []);

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div 
      className="bg-white rounded-[10px] shadow-lg mx-4 sm:mx-auto"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '609px',
        minHeight: '588px',
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
            id="new-password-heading"
            className="text-2xl sm:text-3xl"
            style={{
              width: '350px',
              maxWidth: '100%',
              height: '32px',
              fontFamily: 'Open Sauce Sans',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '32px',
              lineHeight: '32px',
              color: '#021C3E',
              marginBottom: '13px'
            }}
          >
            Create new password
          </h1>
          <p 
            id="new-password-instructions"
            style={{
              width: '381px',
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
            Create a new password for your Tendar account.
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
          aria-labelledby="new-password-heading"
          aria-describedby="new-password-instructions"
        >
          {/* New Password Field */}
          <div style={{ marginBottom: '32px' }}>
            <label 
              htmlFor="new-password-input"
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
              New Password
            </label>
            
            <div className="relative">
              <input
                id="new-password-input"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter your password"
                className={`focus:outline-none transition-colors ${
                  errors.newPassword 
                    ? 'border-red-500' 
                    : 'focus:border-blue-500'
                }`}
                style={{
                  boxSizing: 'border-box',
                  position: 'relative',
                  width: '439px',
                  maxWidth: '100%',
                  height: '49px',
                  background: '#F9FAFC',
                  border: errors.newPassword ? '2px solid #F04438' : '1px solid #BCC7D3',
                  borderRadius: '3px',
                  padding: '16px 50px 16px 20px',
                  fontFamily: 'Open Sauce Sans',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '17px',
                  color: '#6A707E'
                }}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'new-password-error' : 'new-password-description'}
                disabled={isLoading}
                autoComplete="new-password"
              />
              
              {/* Password visibility toggle */}
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                style={{ width: '16px', height: '16px' }}
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" fill="#9097A5"/>
                  <path d="M8 5.5C6.62 5.5 5.5 6.62 5.5 8C5.5 9.38 6.62 10.5 8 10.5C9.38 10.5 10.5 9.38 10.5 8C10.5 6.62 9.38 5.5 8 5.5Z" fill="#9097A5"/>
                  {showPasswords.new && (
                    <path d="M1 1L15 15" stroke="#9097A5" strokeWidth="2" strokeLinecap="round"/>
                  )}
                </svg>
              </button>
            </div>
            
            {errors.newPassword && (
              <p 
                id="new-password-error"
                className="mt-1 text-red-500 text-sm"
                role="alert"
              >
                {errors.newPassword}
              </p>
            )}
            <div id="new-password-description" className="sr-only">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '64px' }}>
            <label 
              htmlFor="confirm-password-input"
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
              Confirm Password
            </label>
            
            <div className="relative">
              <input
                id="confirm-password-input"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Enter your password"
                className={`focus:outline-none transition-colors ${
                  errors.confirmPassword 
                    ? 'border-red-500' 
                    : 'focus:border-blue-500'
                }`}
                style={{
                  boxSizing: 'border-box',
                  position: 'relative',
                  width: '439px',
                  maxWidth: '100%',
                  height: '49px',
                  background: '#F9FAFC',
                  border: errors.confirmPassword ? '2px solid #F04438' : '1px solid #BCC7D3',
                  borderRadius: '3px',
                  padding: '16px 50px 16px 20px',
                  fontFamily: 'Open Sauce Sans',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '17px',
                  color: '#6A707E'
                }}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : 'confirm-password-description'}
                disabled={isLoading}
                autoComplete="new-password"
              />
              
              {/* Password visibility toggle */}
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                style={{ width: '16px', height: '16px' }}
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" fill="#9097A5"/>
                  <path d="M8 5.5C6.62 5.5 5.5 6.62 5.5 8C5.5 9.38 6.62 10.5 8 10.5C9.38 10.5 10.5 9.38 10.5 8C10.5 6.62 9.38 5.5 8 5.5Z" fill="#9097A5"/>
                  {showPasswords.confirm && (
                    <path d="M1 1L15 15" stroke="#9097A5" strokeWidth="2" strokeLinecap="round"/>
                  )}
                </svg>
              </button>
            </div>
            
            {errors.confirmPassword && (
              <p 
                id="confirm-password-error"
                className="mt-1 text-red-500 text-sm"
                role="alert"
              >
                {errors.confirmPassword}
              </p>
            )}
            <div id="confirm-password-description" className="sr-only">
              Re-enter your password to confirm it matches.
            </div>
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
              width: '421px',
              maxWidth: '100%',
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
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
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

        {/* Screen reader status announcements */}
        <div 
          id="new-password-status" 
          className="sr-only" 
          aria-live="assertive" 
          aria-atomic="true"
        ></div>

        {/* Additional accessibility information */}
        <div className="sr-only">
          <p>This page allows you to create a new password for your account.</p>
          <p>Your password must be at least 8 characters long and include uppercase, lowercase, number, and special character.</p>
        </div>
      </div>
    </div>
  );
}