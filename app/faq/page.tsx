'use client';

import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How do I place an order?',
      a: 'Browse our products, add items to cart, proceed to checkout, fill delivery details, and complete payment via Paystack.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept card payments via Paystack. You can pay with debit/credit cards.'
    },
    {
      q: 'How long does delivery take?',
      a: 'We deliver to your hostel within 24-48 hours after payment confirmation.'
    },
    {
      q: 'How does the referral system work?',
      a: 'Share your referral link. When someone buys using your link, you earn ₦2,000 per shoe!'
    },
    {
      q: 'How do I become an influencer?',
      a: 'Contact us or check your dashboard. Influencers get special public pages to share with their audience.'
    },
    {
      q: 'Can I return a product?',
      a: 'Yes, within 7 days of delivery if the product has issues. Contact us for returns.'
    },
    {
      q: 'How do I withdraw my earnings?',
      a: 'Go to your dashboard → Withdraw. Add your bank details and request withdrawal. Minimum ₦50.'
    },
    {
      q: 'Is my information safe?',
      a: 'Yes! We use Firebase security and Paystack for secure payments. Your data is protected.'
    }
  ];

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Frequently Asked Questions</h1>
          <p className="opacity-70 mb-8">Find answers to common questions about EAZY</p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card)' }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>{faq.q}</h3>
                <p className="opacity-80">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="opacity-70">Still have questions?</p>
            <Link href="/contact" className="inline-block mt-2 px-6 py-3 rounded-xl font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}