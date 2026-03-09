'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth-service';
import '@/lib/cognito-config'; // Initialize Amplify

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = searchParams.get('returnTo') || 'https://marketpay.app';
  const organization = searchParams.get('organization');

  // Check for existing session and auto-redirect
  useEffect(() => {
    (async () => {
      try {
        const session = await authService.getSession();
        if (session.success && session.session?.tokens?.idToken) {
          const idToken = session.session.tokens.idToken.toString();
          const accessToken = session.session.tokens.accessToken?.toString();
          const redirectUrl = new URL(returnTo);
          if (idToken) redirectUrl.searchParams.set('id_token', idToken);
          if (accessToken) redirectUrl.searchParams.set('access_token', accessToken);
          if (organization) redirectUrl.searchParams.set('organization', organization);
          window.location.href = redirectUrl.toString();
        }
      } catch {}
    })();
  }, [returnTo, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.signIn({
        username: email,
        password,
      });

      if (result.success && result.isSignedIn) {
        // Redirect back to the main app with tokens
        const redirectUrl = new URL(returnTo);
        if (result.tokens?.idToken) {
          redirectUrl.searchParams.set('id_token', result.tokens.idToken);
        }
        if (result.tokens?.accessToken) {
          redirectUrl.searchParams.set('access_token', result.tokens.accessToken);
        }
        if (organization) {
          redirectUrl.searchParams.set('organization', organization);
        }

        window.location.href = redirectUrl.toString();
      } else if (result.success && result.nextStep) {
        // Handle additional steps (MFA, password reset, etc.)
        setError(`Additional step required: ${result.nextStep.signInStep}`);
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/marketpay_logo.webp"
              alt="MarketPay"
              width={240}
              height={68}
              priority
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>

        {organization && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Organization: {organization}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Loading...</h1>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}