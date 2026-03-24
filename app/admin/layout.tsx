'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// List of admin emails
const ADMIN_EMAILS = [
  
  'israelolalere2008@gmail.com',
  'israel2008'
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Current user:', user?.email);
      
      if (!user) {
        console.log('No user, redirecting to auth');
        sessionStorage.setItem('redirectAfterLogin', '/admin');
        router.push('/auth');
        setLoading(false);
        return;
      }

      // Check if email is in admin list
      const userEmail = user.email || '';
      const emailIsAdmin = ADMIN_EMAILS.includes(userEmail);
      
      console.log('User email:', userEmail);
      console.log('Is in admin list?', emailIsAdmin);
      console.log('Admin list:', ADMIN_EMAILS);
      
      if (emailIsAdmin) {
        console.log('✅ User is admin, granting access');
        setIsAdmin(true);
      } else {
        console.log('❌ User is NOT admin, redirecting to home');
        router.push('/');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">EAZY Admin</h1>
              <nav className="flex space-x-4">
                <Link href="/admin" className="hover:text-gray-300 transition">Dashboard</Link>
                <Link href="/admin/products" className="hover:text-gray-300 transition">Products</Link>
                <Link href="/admin/orders" className="hover:text-gray-300 transition">Orders</Link>
                <Link href="/admin/withdrawals" className="hover:text-gray-300 transition">
  Withdrawals
</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">{auth.currentUser?.email}</span>
              <button
                onClick={() => auth.signOut()}
                className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}