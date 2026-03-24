'use client';

import { Inter } from "next/font/google";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import { CartProvider } from '@/context/CartContext';
import CartIcon from '@/components/ui/CartIcon';
import WhatsAppButton from '@/components/ui/WhatsAppButton'; // Add this import
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl font-black bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                  EAZY
                </span>
              </Link>
              
              <div className="flex items-center space-x-6">
                <Link href="/" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Home
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Products
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Dashboard
                </Link>
                
                <CartIcon />
                
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 hidden md:inline">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-700 transition-all duration-300 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </header>

          {children}

          <footer className="bg-black text-white py-12">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 EAZY. All rights reserved.</p>
            </div>
          </footer>

          {/* WhatsApp Button */}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}