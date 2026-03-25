'use client';

import { Inter } from "next/font/google";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import { CartProvider } from '@/context/CartContext';
import CartIcon from '@/components/ui/CartIcon';
import SearchBar from '@/components/ui/SearchBar';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { WishlistProvider } from '@/context/WishlistContext';
import WishlistIcon from '@/components/ui/WishlistIcon';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <WishlistProvider>
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                  EAZY
                </span>
              </Link>
              
              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Home
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Products
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Dashboard
                </Link>
                <WishlistIcon />
                <CartIcon />
                <SearchBar />
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 hidden lg:inline">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:bg-gray-800 transition"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-3 md:hidden">
                <WishlistIcon />
                <CartIcon />
                <SearchBar />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3">
                <Link
                  href="/"
                  className="block py-2 text-gray-600 hover:text-black transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="block py-2 text-gray-600 hover:text-black transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-600 hover:text-black transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {user ? (
                  <>
                    <p className="text-sm text-gray-500 py-2">{user.email}</p>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-red-600 text-white py-2 rounded-full font-semibold text-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="block w-full bg-black text-white py-2 rounded-full font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </header>

          {children}

          <footer className="bg-black text-white py-8">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">&copy; 2024 EAZY. All rights reserved.</p>
            </div>
          </footer>

          <WhatsAppButton />
        </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
