'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import Link from 'next/link';

// Types and Interfaces
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

export default function SystemAdminSignInPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    keepSignedIn: false
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Use auth loading state
  const isLoading = authLoading;

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
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

  // Form handlers
  const handleInputChange = (field: keyof SignInFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'keepSignedIn' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing (debounced to prevent excessive re-renders)
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('Form submitted, preventing default behavior');
    
    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.keepSignedIn,
        userType: 'system-admin'
      });
      
      // Login success - AuthContext will handle redirect
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle different types of errors
      if (error.status === 401) {
        setErrors({ general: 'Invalid email or password' });
      } else if (error.type === 'network') {
        setErrors({ general: 'Connection failed. Please check your internet connection and try again.' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    }
  };

  const togglePasswordVisibility = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-[609px] mx-4 bg-white rounded-[10px] shadow-lg">
      {/* Form Container */}
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 
            style={{
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: '32px',
              color: '#021C3E',
              fontFamily: 'Open Sauce Sans, sans-serif',
              marginBottom: '8px'
            }}
          >
            Hello,
          </h1>
          <p 
            style={{
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '16px',
              color: '#021C3E',
              opacity: 0.5,
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Sign in to your account
          </p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div 
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
          >
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} role="form" aria-labelledby="signin-heading">
          {/* Email Field */}
          <div className="mb-5">
            <label 
              htmlFor="email"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '22px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email"
                className={`w-full border rounded-[3px] focus:outline-none transition-colors ${
                  errors.email 
                    ? 'border-red-500 border-2' 
                    : 'border-[#BCC7D3] focus:border-blue-500'
                }`}
                style={{
                  height: '49px',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '17px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#F9FAFC',
                  color: '#6A707E'
                }}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isLoading}
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

          {/* Password Field */}
          <div className="mb-6">
            <label 
              htmlFor="password"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '22px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Enter your password"
                className={`w-full border rounded-[3px] focus:outline-none transition-colors pr-12 ${
                  errors.password 
                    ? 'border-red-500 border-2' 
                    : 'border-[#BCC7D3] focus:border-blue-500'
                }`}
                style={{
                  height: '49px',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '17px',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                  backgroundColor: '#F9FAFC',
                  color: '#6A707E'
                }}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={isLoading}
              />
              {/* Password Toggle Button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-gray-600 transition-colors"
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Checkbox
                id="keep-signed-in"
                checked={formData.keepSignedIn}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, keepSignedIn: !!checked }))
                }
                disabled={isLoading}
                className="w-5 h-5"
                style={{
                  backgroundColor: '#F9FAFC',
                  border: '1px solid #BCC7D3',
                  borderRadius: '3px'
                }}
              />
              <label 
                htmlFor="keep-signed-in"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#464A53',
                  fontFamily: 'Open Sauce Sans, sans-serif',
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
                fontFamily: 'Open Sauce Sans, sans-serif',
                textDecoration: 'none'
              }}
              className="hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
            style={{
              height: '44px',
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
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}