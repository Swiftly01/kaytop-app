'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BranchManagerLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve any existing query parameters during redirect
    const params = new URLSearchParams(searchParams.toString());
    const redirectUrl = params.size > 0 
      ? `/auth/login?${params.toString()}` 
      : '/auth/login';
    
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Redirecting to login...</span>
    </div>
  );
}
