'use client';

import { Inter } from "next/font/google";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import CartIcon from '@/components/ui/CartIcon';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
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
        <ThemeProvider>
          <CartProvider>
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
              <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    EAZY
                  </span>
                </Link>
                
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <CartIcon />
                  
                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition">Home</Link>
                    <Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition">Products</Link>
                    <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition">Dashboard</Link>
                    <Link href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition">FAQ</Link>
                    
                    {user ? (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:inline">{user.email}</span>
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
                        className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 px-4 space-y-3">
                  <Link href="/" className="block py-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link href="/products" className="block py-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Products</Link>
                  <Link href="/dashboard" className="block py-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/faq" className="block py-2 text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                  {user ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-2">{user.email}</p>
                      <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-full">Logout</button>
                    </>
                  ) : (
                    <Link href="/auth" className="block w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  )}
                </div>
              )}
            </header>

            {children}

            <footer className="bg-black dark:bg-gray-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">EAZY</h3>
                    <p className="text-gray-400">Premium shoes delivered to your campus. Refer friends and earn rewards.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                      <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
                      <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                      <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                      <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                      <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Categories</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>Sneakers</li>
                      <li>Running</li>
                      <li>Lifestyle</li>
                      <li>Slides</li>
                      <li>Skateboarding</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Follow Us</h4>
                    <div className="flex space-x-4">
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-2xl">📸</a>
                      <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-2xl">🎵</a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-2xl">🐦</a>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-2xl">▶️</a>
                    </div>
                    <p className="text-gray-400 mt-4 text-sm">campus@eazy.com</p>
                    <p className="text-gray-500 text-xs mt-2">📞 08073042250</p>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                  <p>&copy; 2024 EAZY. All rights reserved. Made with ❤️ for campus students.</p>
                </div>
              </div>
            </footer>

            <WhatsAppButton />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}