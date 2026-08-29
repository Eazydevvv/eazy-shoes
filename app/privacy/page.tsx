'use client';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black mb-6" style={{ color: 'var(--foreground)' }}>Privacy Policy</h1>
          <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: 'var(--card)' }}>
            <p className="mb-4 opacity-70">Last updated: August 2024</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">Information We Collect</h2>
            <p>We collect your name, email, phone number, and delivery address when you create an account or place an order.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">How We Use Your Information</h2>
            <p>- Process your orders and payments<br />- Send order confirmations and updates<br />- Improve our services</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">Data Security</h2>
            <p>We use Firebase and Paystack to keep your data secure. Payment information is handled by Paystack, not stored by us.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">Your Rights</h2>
            <p>You can request to view, update, or delete your data at any time. Email us at campus@eazy.com.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">Cookies</h2>
            <p>We use cookies to remember your preferences and improve your experience.</p>
            
            <h2 className="text-xl font-bold mt-6 mb-2">Contact</h2>
            <p>Questions? Email us at campus@eazy.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}