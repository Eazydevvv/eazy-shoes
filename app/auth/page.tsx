'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '@/lib/firebase/users';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Welcome back! Redirecting...');
        
        let redirectUrl = '/';
        if (typeof window !== 'undefined') {
          redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
          sessionStorage.removeItem('redirectAfterLogin');
        }
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user.uid, email, referralCode || undefined);
        setSuccess('Account created! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
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
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-400 rounded-2xl rotate-45 transform hover:rotate-0 transition-all duration-500 shadow-xl flex items-center justify-center">
              <span className="-rotate-45 text-4xl">👟</span>
            </div>
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">EAZY</h2>
          <p className="mt-2 opacity-70">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join the EAZY community and start earning.'}
          </p>
        </div>

        <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-8 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex rounded-2xl p-1 mb-8" style={{ backgroundColor: 'var(--background)' }}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isLogin ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'opacity-70 hover:opacity-100'
              }`}
              style={!isLogin ? { color: 'var(--foreground)' } : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                !isLogin ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'opacity-70 hover:opacity-100'
              }`}
              style={isLogin ? { color: 'var(--foreground)' } : {}}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                placeholder="••••••••"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <Link href="/auth/forgot-password" className="text-sm opacity-70 hover:opacity-100 transition" style={{ color: 'var(--foreground)' }}>
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs opacity-50">
            By continuing, you agree to EAZY's{' '}
            <Link href="#" className="underline hover:opacity-100" style={{ color: 'var(--foreground)' }}>Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}