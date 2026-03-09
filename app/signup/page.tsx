'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import '@/lib/cognito-config'; // Initialize Amplify

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const returnTo = searchParams.get('returnTo') || 'https://marketpay.app';
  const organization = searchParams.get('organization');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.signUp({
        email,
        password,
        name: name || email.split('@')[0],
      });

      if (result.success) {
        if (result.isSignUpComplete) {
          // Auto sign in and redirect
          const signInResult = await authService.signIn({
            username: email,
            password,
          });

          if (signInResult.success && signInResult.isSignedIn) {
            const redirectUrl = new URL(returnTo);
            if (signInResult.tokens?.idToken) {
              redirectUrl.searchParams.set('id_token', signInResult.tokens.idToken);
            }
            if (signInResult.tokens?.accessToken) {
              redirectUrl.searchParams.set('access_token', signInResult.tokens.accessToken);
            }
            if (organization) {
              redirectUrl.searchParams.set('organization', organization);
            }
            window.location.href = redirectUrl.toString();
          }
        } else {
          // Need confirmation
          setShowConfirmation(true);
        }
      } else {
        setError(result.error || 'Failed to sign up');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (result.success && result.isSignUpComplete) {
        // Sign in after confirmation
        const signInResult = await authService.signIn({
          username: email,
          password,
        });

        if (signInResult.success && signInResult.isSignedIn) {
          const redirectUrl = new URL(returnTo);
          if (signInResult.tokens?.idToken) {
            redirectUrl.searchParams.set('id_token', signInResult.tokens.idToken);
          }
          if (signInResult.tokens?.accessToken) {
            redirectUrl.searchParams.set('access_token', signInResult.tokens.accessToken);
          }
          if (organization) {
            redirectUrl.searchParams.set('organization', organization);
          }
          window.location.href = redirectUrl.toString();
        }
      } else {
        setError(result.error || 'Failed to confirm sign up');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await authService.resendConfirmationCode(email);
      if (result.success) {
        setError('Confirmation code resent to your email');
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MarketPay</h1>
            <h2 className="text-2xl font-semibold text-gray-700">Confirm your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a confirmation code to {email}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleConfirmation}>
            {error && (
              <div className={`${error.includes('resent') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-md text-sm`}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Confirmation Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter 6-digit code"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
              >
                Resend confirmation code
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MarketPay</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the MarketPay community
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
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