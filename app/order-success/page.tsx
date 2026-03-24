// app/order-success/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  useEffect(() => {
    // Clear cart from session
    sessionStorage.removeItem('checkoutCart');
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-black mb-2">Order Placed! 🎉</h1>
            <p className="text-gray-600 text-lg">
              Thank you for shopping with EAZY. Your order has been received.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold">Order Confirmation</p>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation SMS shortly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold">Delivery</p>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered to your hostel within 24 hours.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold">Payment</p>
                  <p className="text-sm text-gray-600">
                    Pay with cash or campus card upon delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-2">Refer a Friend & Earn!</h3>
            <p className="mb-4">Get $20 off your next order when they make their first purchase.</p>
            <button className="bg-white text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
              Share Your Referral Link
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/dashboard"
              className="border-2 border-black text-black px-8 py-4 rounded-xl font-semibold hover:bg-black hover:text-white transition"
            >
              Track Your Order
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}