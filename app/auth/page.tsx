'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '@/lib/firebase/users';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  // Only use localStorage/sessionStorage in browser
  const isBrowser = typeof window !== 'undefined';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Welcome back! Redirecting...');
        
        // Check for redirect URL (only in browser)
        let redirectUrl = '/';
        if (isBrowser) {
          redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
          sessionStorage.removeItem('redirectAfterLogin');
        }
        
        // Check for pending referral (product-specific)
        let pendingRef = null;
        let pendingProduct = null;
        if (isBrowser) {
          pendingRef = localStorage.getItem('pendingReferral');
          pendingProduct = localStorage.getItem('pendingProduct');
        }
        
        if (pendingRef && pendingProduct) {
          // Redirect back to product with referral code
          setTimeout(() => {
            window.location.href = `/product/${pendingProduct}?ref=${pendingRef}`;
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        }
        
      } else {
        // Get referral code from URL
        const referralCode = searchParams.get('ref');
        
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user profile
        await createUserProfile(
          userCredential.user.uid, 
          email, 
          referralCode || undefined
        );
        
        setSuccess('Account created! Redirecting...');
        
        // Check for pending product referral
        let pendingProduct = null;
        if (isBrowser) {
          pendingProduct = localStorage.getItem('pendingProduct');
        }
        
        setTimeout(() => {
          if (pendingProduct) {
            window.location.href = `/product/${pendingProduct}`;
          } else {
            window.location.href = '/dashboard';
          }
        }, 1500);
      }
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        console.error(error);
        setError('Something went wrong. Please try again.');
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-black to-gray-700 rounded-2xl rotate-45 transform hover:rotate-0 transition-all duration-500 shadow-xl flex items-center justify-center">
                <span className="-rotate-45 text-4xl">👟</span>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
            EAZY
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join the EAZY community and start earning.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isLogin 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                !isLogin 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
              {!isLogin && (
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

          {isLogin && (
  <div className="flex items-center justify-end">
    <Link
      href="/auth/forgot-password"
      className="text-sm text-gray-600 hover:text-black transition-colors"
    >
      Forgot password?
    </Link>
  </div>
)}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-semibold 
                transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-gray-800 hover:to-black'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Placeholder (for future) */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all duration-300">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all duration-300">
              <svg className="h-5 w-5 mr-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to EAZY's{' '}
            <a href="#" className="text-black hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-black hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}