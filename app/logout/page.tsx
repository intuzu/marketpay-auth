'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { authService } from '@/lib/auth-service';
import '@/lib/cognito-config';

function LogoutHandler() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Signing out...');
  const returnTo = searchParams.get('returnTo') || 'https://marketpay.app';

  useEffect(() => {
    (async () => {
      try {
        await authService.signOut();
        setStatus('Signed out. Redirecting...');
      } catch (e) {
        console.error('Sign out error:', e);
        setStatus('Redirecting...');
      }
      // Redirect after signout completes
      window.location.href = returnTo;
    })();
  }, [returnTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700">{status}</h1>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Signing out...</h1>
        </div>
      </div>
    }>
      <LogoutHandler />
    </Suspense>
  );
}
