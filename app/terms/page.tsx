'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black mb-6" style={{ color: 'var(--foreground)' }}>Terms of Service</h1>
          <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'var(--card)' }}>
            <p className="mb-4 opacity-70">Last updated: August 2024</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">1. Acceptance of Terms</h2>
            <p>By using EAZY, you agree to these terms. If you don't agree, please don't use our service.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">2. Products & Pricing</h2>
            <p>All prices are in Naira (₦). We reserve the right to change prices at any time.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">3. Orders & Delivery</h2>
            <p>Orders are processed within 24 hours. Delivery to hostels within 24-48 hours after payment confirmation.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">4. Refunds & Returns</h2>
            <p>Returns accepted within 7 days of delivery for defective products. Contact support for returns.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">5. Referral Program</h2>
            <p>Referral rewards are ₦2,000 per shoe sold. Rewards are credited after successful delivery.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">6. Privacy</h2>
            <p>Your data is protected. We only use your information for order processing and communication.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">7. Contact</h2>
            <p>Questions? Email us at campus@eazy.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}