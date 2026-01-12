// 'use client';

// import { useState, useEffect, useRef, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { OtpService } from '@/lib/services/otp.service';

// // Types and Interfaces
// interface OtpVerificationFormData {
//   otp: string[];
// }

// interface ValidationErrors {
//   otp?: string;
//   general?: string;
// }

// interface OtpVerificationRequest {
//   otp: string;
//   email?: string;
//   userType: 'system-admin';
// }

// interface OtpVerificationResponse {
//   success: boolean;
//   message?: string;
//   error?: string;
//   token?: string;
// }

// function VerifyOtpPageContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const email = searchParams.get('email');
  
//   // Form state
//   const [formData, setFormData] = useState<OtpVerificationFormData>({
//     otp: ['', '', '', '', '', '']
//   });
  
//   const [errors, setErrors] = useState<ValidationErrors>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [resendCooldown, setResendCooldown] = useState(0);
//   const [resendAttempts, setResendAttempts] = useState(0);
  
//   // Refs for OTP inputs
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   // Validation functions
//   const validateOtp = (otp: string[]): string | undefined => {
//     const otpString = otp.join('');
//     if (otpString.length !== 6) {
//       return 'Please enter all 6 digits';
//     }
//     if (!/^\d{6}$/.test(otpString)) {
//       return 'OTP must contain only numbers';
//     }
//     return undefined;
//   };

//   const validateForm = (): boolean => {
//     const newErrors: ValidationErrors = {};
    
//     const otpError = validateOtp(formData.otp);
//     if (otpError) newErrors.otp = otpError;
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // OTP input handlers
//   const handleOtpChange = (value: string, index: number) => {
//     // Only allow single digit
//     if (value.length > 1) return;
    
//     // Only allow numbers
//     if (value && !/^\d$/.test(value)) return;

//     const newOtp = [...formData.otp];
//     newOtp[index] = value;
//     setFormData(prev => ({ ...prev, otp: newOtp }));

//     // Clear errors when user starts typing
//     if (errors.otp || errors.general) {
//       setErrors({});
//     }

//     // Auto-focus next input
//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }

//     // Auto-submit when all fields are filled
//     if (value && newOtp.every(digit => digit !== '')) {
//       // Small delay to ensure state is updated
//       setTimeout(() => {
//         handleSubmit();
//       }, 100);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
//     // Handle backspace
//     if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
    
//     // Handle arrow keys
//     if (e.key === 'ArrowLeft' && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//     if (e.key === 'ArrowRight' && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }

//     // Handle paste
//     if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
//       e.preventDefault();
//       navigator.clipboard.readText().then(text => {
//         const digits = text.replace(/\D/g, '').slice(0, 6).split('');
//         if (digits.length === 6) {
//           const newOtp = [...formData.otp];
//           digits.forEach((digit, i) => {
//             newOtp[i] = digit;
//           });
//           setFormData(prev => ({ ...prev, otp: newOtp }));
//           inputRefs.current[5]?.focus();
//         }
//       });
//     }
//   };

//   // Submit handler
//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
//     setErrors({});

//     try {
//       // Import authService dynamically to avoid SSR issues
//       // const { authService } = await import('@/lib/services/auth');
      
//       await OtpService.verify({
//             email: email!,
//             code: formData.otp.join(""),
//             purpose: "email_verification",
//             });
      
//       // Success - redirect to set new password page
//       router.push(`/auth/system-admin/new-password?email=${encodeURIComponent(email || '')}`);
      
//     } catch (error: any) {
//       console.error('OTP verification error:', error);
      
//       if (error.status === 400) {
//         setErrors({ otp: 'Invalid OTP. Please check and try again.' });
//       } else if (error.status === 410) {
//         setErrors({ general: 'OTP has expired. Please request a new one.' });
//       } else if (error.status === 429) {
//         setErrors({ general: 'Too many attempts. Please try again later.' });
//       } else if (error.type === 'network') {
//         setErrors({ general: 'Connection failed. Please check your internet connection and try again.' });
//       } else {
//         setErrors({ general: error.message || 'Verification failed. Please try again.' });
//       }
      
//       // Clear OTP on error
//       setFormData({ otp: ['', '', '', '', '', ''] });
//       inputRefs.current[0]?.focus();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Resend OTP handler
//   const handleResendOtp = async () => {
//     if (resendCooldown > 0 || resendAttempts >= 3 || !email) return;

//     try {
//       // Import authService dynamically to avoid SSR issues
//       // const { authService } = await import('@/lib/services/auth');
      
//       await OtpService.send({
//         email,
//         purpose: "email_verification",
//         });
      
//       setResendAttempts(prev => prev + 1);
//       setResendCooldown(60);
//       setErrors({});
      
//       // Show success message briefly
//       setErrors({ general: 'New OTP sent to your email.' });
//       setTimeout(() => setErrors({}), 3000);
      
//     } catch (error: any) {
//       console.error('Resend OTP error:', error);
      
//       if (error.type === 'network') {
//         setErrors({ general: 'Connection failed. Please check your internet connection and try again.' });
//       } else {
//         setErrors({ general: error.message || 'Failed to resend OTP. Please try again.' });
//       }
//     }
//   };

//   // Back to forgot password
//   const handleBack = () => {
//     router.push('/auth/system-admin/forgot-password');
//   };

//   // Resend cooldown timer
//   useEffect(() => {
//     if (resendCooldown > 0) {
//       const timer = setTimeout(() => {
//         setResendCooldown(prev => prev - 1);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendCooldown]);

//   // Auto-focus first input on mount
//   useEffect(() => {
//     inputRefs.current[0]?.focus();
//   }, []);

//   // Security: Clear data on unmount
//   useEffect(() => {
//     return () => {
//       setFormData({ otp: ['', '', '', '', '', ''] });
//       setErrors({});
//     };
//   }, []);

//   // Redirect if no email parameter
//   useEffect(() => {
//     if (!email) {
//       router.push('/auth/system-admin/forgot-password');
//     }
//   }, [email, router]);

//   return (
//     <div 
//       className="bg-white rounded-[10px] shadow-lg mx-4 sm:mx-auto"
//       style={{
//         position: 'relative',
//         width: '100%',
//         maxWidth: '563px',
//         minHeight: '458px',
//         margin: '0 auto',
//         background: '#FFFFFF',
//         borderRadius: '10px'
//       }}
//     >
//       {/* Form Container */}
//       <div 
//         className="p-4 sm:p-6 md:p-8"
//         style={{ 
//           padding: 'clamp(16px, 4vw, 32px)'
//         }}
//       >
//         {/* Header */}
//         <div style={{ marginBottom: '32px', textAlign: 'center' }}>
//           <h1 
//             style={{
//               width: '266px',
//               height: '32px',
//               fontFamily: 'Open Sauce Sans',
//               fontStyle: 'normal',
//               fontWeight: 700,
//               fontSize: '32px',
//               lineHeight: '32px',
//               color: '#021C3E',
//               marginBottom: '13px',
//               margin: '0 auto 13px'
//             }}
//           >
//             Verify your email
//           </h1>
//           <p 
//             style={{
//               width: '429px',
//               maxWidth: '100%',
//               height: '16px',
//               fontFamily: 'Open Sauce Sans',
//               fontStyle: 'normal',
//               fontWeight: 500,
//               fontSize: '16px',
//               lineHeight: '16px',
//               color: '#021C3E',
//               opacity: 0.5,
//               margin: '0 auto'
//             }}
//           >
//             Please enter the OTP sent to your email for verification
//           </p>
//         </div>

//         {/* Error Messages */}
//         {errors.general && (
//           <div 
//             className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
//             role="alert"
//             aria-live="polite"
//           >
//             <div className="flex items-center">
//               <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               <p className="text-red-600 text-sm font-medium">{errors.general}</p>
//             </div>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           {/* Enter OTP Label */}
//           <div style={{ marginBottom: '16px' }}>
//             <label 
//               style={{
//                 fontFamily: 'Open Sauce Sans',
//                 fontStyle: 'normal',
//                 fontWeight: 400,
//                 fontSize: '14px',
//                 lineHeight: '22px',
//                 display: 'flex',
//                 alignItems: 'flex-end',
//                 color: '#464A53'
//               }}
//             >
//               Enter OTP
//             </label>
//           </div>

//           {/* OTP Input Group */}
//           <div 
//             style={{
//               display: 'flex',
//               justifyContent: 'center',
//               gap: '12px',
//               marginBottom: '32px'
//             }}
//           >
//             {formData.otp.map((digit, index) => (
//               <input
//                 key={index}
//                 ref={(ref) => {
//                   inputRefs.current[index] = ref;
//                 }}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={1}
//                 value={digit}
//                 onChange={(e) => handleOtpChange(e.target.value, index)}
//                 onKeyDown={(e) => handleKeyDown(e, index)}
//                 className={`focus:outline-none transition-all ${
//                   errors.otp 
//                     ? 'border-red-500 bg-red-50' 
//                     : digit 
//                       ? 'border-[#7F56D9] bg-[#F9F5FF]'
//                       : 'border-[#979DAC] bg-white focus:border-[#7F56D9] focus:bg-[#F9F5FF]'
//                 }`}
//                 style={{
//                   boxSizing: 'border-box',
//                   width: '62px',
//                   height: '50px',
//                   background: digit ? '#F9F5FF' : '#FFFFFF',
//                   border: errors.otp 
//                     ? '2px solid #F04438' 
//                     : digit 
//                       ? '1px solid #7F56D9'
//                       : '1px solid #979DAC',
//                   borderRadius: '5px',
//                   fontFamily: 'Open Sauce Sans',
//                   fontStyle: 'normal',
//                   fontWeight: 600,
//                   fontSize: '24px',
//                   lineHeight: '32px',
//                   textAlign: 'center',
//                   color: '#021C3E'
//                 }}
//                 disabled={isLoading}
//                 aria-label={`OTP digit ${index + 1}`}
//               />
//             ))}
//           </div>

//           {/* OTP Error */}
//           {errors.otp && (
//             <p 
//               className="text-red-500 text-sm text-center mb-4"
//               role="alert"
//             >
//               {errors.otp}
//             </p>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isLoading || formData.otp.some(digit => digit === '')}
//             className="hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
//             style={{
//               boxSizing: 'border-box',
//               display: 'flex',
//               flexDirection: 'row',
//               justifyContent: 'center',
//               alignItems: 'center',
//               padding: '10px 18px',
//               gap: '8px',
//               position: 'relative',
//               width: '421px',
//               maxWidth: '100%',
//               height: '44px',
//               background: '#7F56D9',
//               border: '1px solid #7F56D9',
//               boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
//               borderRadius: '8px',
//               margin: '0 auto 24px'
//             }}
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 <span 
//                   style={{
//                     fontFamily: 'Open Sauce Sans',
//                     fontStyle: 'normal',
//                     fontWeight: 600,
//                     fontSize: '16px',
//                     lineHeight: '24px',
//                     color: '#FFFFFF'
//                   }}
//                 >
//                   Verifying...
//                 </span>
//               </div>
//             ) : (
//               <span 
//                 style={{
//                   width: '56px',
//                   height: '24px',
//                   fontFamily: 'Open Sauce Sans',
//                   fontStyle: 'normal',
//                   fontWeight: 600,
//                   fontSize: '16px',
//                   lineHeight: '24px',
//                   color: '#FFFFFF'
//                 }}
//               >
//                 Submit
//               </span>
//             )}
//           </button>
//         </form>

//         {/* Resend Section */}
//         <div className="text-center mb-6">
//           <p 
//             style={{
//               fontFamily: 'Open Sauce Sans',
//               fontStyle: 'normal',
//               fontWeight: 400,
//               fontSize: '14px',
//               lineHeight: '22px',
//               color: '#464A53',
//               marginBottom: '8px'
//             }}
//           >
//             Didn't receive the code?{' '}
//             {resendCooldown > 0 ? (
//               <span 
//                 style={{
//                   fontFamily: 'Open Sauce Sans',
//                   fontStyle: 'normal',
//                   fontWeight: 400,
//                   fontSize: '14px',
//                   lineHeight: '22px',
//                   color: '#767D94'
//                 }}
//               >
//                 Resend in {resendCooldown}s
//               </span>
//             ) : resendAttempts >= 3 ? (
//               <span 
//                 style={{
//                   fontFamily: 'Open Sauce Sans',
//                   fontStyle: 'normal',
//                   fontWeight: 400,
//                   fontSize: '14px',
//                   lineHeight: '22px',
//                   color: '#767D94'
//                 }}
//               >
//                 Maximum attempts reached
//               </span>
//             ) : (
//               <button
//                 onClick={handleResendOtp}
//                 className="hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-primary-500-alt focus:ring-offset-2 rounded-md"
//                 style={{
//                   fontFamily: 'Open Sauce Sans',
//                   fontStyle: 'normal',
//                   fontWeight: 500,
//                   fontSize: '14px',
//                   lineHeight: '22px',
//                   color: '#7A62EB',
//                   background: 'transparent',
//                   border: 'none',
//                   textDecoration: 'underline'
//                 }}
//               >
//                 Resend OTP
//               </button>
//             )}
//           </p>
//         </div>

//         {/* Back Button */}
//         <div className="text-center">
//           <button
//             onClick={handleBack}
//             className="text-primary-500-alt hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500-alt focus:ring-offset-2 rounded-md"
//             style={{
//               display: 'flex',
//               flexDirection: 'row',
//               justifyContent: 'center',
//               alignItems: 'center',
//               padding: '15px 20px',
//               gap: '10px',
//               width: '100%',
//               maxWidth: '421px',
//               height: '54px',
//               borderRadius: '3px',
//               fontFamily: 'Open Sauce Sans',
//               fontStyle: 'normal',
//               fontWeight: 700,
//               fontSize: '19px',
//               lineHeight: '24px',
//               color: '#7A62EB',
//               background: 'transparent',
//               border: 'none',
//               margin: '0 auto'
//             }}
//             disabled={isLoading}
//           >
//             Back to Forgot Password
//           </button>
//         </div>

//         {/* Screen reader announcements */}
//         <div 
//           className="sr-only" 
//           aria-live="assertive" 
//           aria-atomic="true"
//         >
//           {isLoading && 'Verifying OTP, please wait...'}
//           {errors.otp && `Error: ${errors.otp}`}
//           {errors.general && `Error: ${errors.general}`}
//         </div>

//         {/* Additional accessibility information */}
//         <div className="sr-only">
//           <p>Enter the 6-digit verification code sent to your email address.</p>
//           <p>Use arrow keys or tab to navigate between input fields.</p>
//           <p>The form will automatically submit when all digits are entered.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function VerifyOtpPage() {
//   return (
//     <Suspense fallback={
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2 text-gray-600">Loading...</span>
//       </div>
//     }>
//       <VerifyOtpPageContent />
//     </Suspense>
//   );
// }

import VerifyOtpForm from "@/app/_components/ui/auth/user/VerifyOtpForm";

export const metadata = {
  title: "Verify OTP"
  
}
export default function page() {
  
  return (
        <div className="bg-white rounded-xl shadow-md p-10 w-full mx-auto max-w-md md:max-w-xl mt-6">
      <h1 className="text-3xl font-medium text-neutral-700">
        Verify your email
      </h1>
      <p className="text-neutral-700 text-md">
        Please enter the OTP sent to your email for verification
      </p>

      <VerifyOtpForm/>
     
    </div>
  );
}
