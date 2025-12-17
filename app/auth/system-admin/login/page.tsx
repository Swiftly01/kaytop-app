import SystemAdminLoginForm from "@/app/_components/ui/auth/SystemAdminLoginForm";
import { JSX } from "react";

export const metadata = {
  title: "System Admin Login",
};

export default function SystemAdminSignInPage(): JSX.Element {
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
              marginBottom: '8px'
            }}
          >
            Hello,
          </h1>
          <p 
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
          >
            Sign in to your account
          </p>
        </div>
        
        <SystemAdminLoginForm />
      </div>
    </div>
  );
}