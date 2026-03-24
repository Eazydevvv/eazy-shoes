// components/payment/PaystackButton.tsx
'use client';

import { useState } from 'react';

interface PaystackButtonProps {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  metadata?: any;
  subaccount?: string | null; // Add this
}

export default function PaystackButton({
  email,
  amount,
  reference,
  onSuccess,
  onClose,
  metadata,
  subaccount
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initializePayment = () => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      setError('Paystack key not configured');
      return;
    }

    setLoading(true);
    setError('');

    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => {
      try {
        // Prepare Paystack options
        const paystackOptions: any = {
          key: publicKey,
          email: email,
          amount: amount * 100,
          ref: reference,
          metadata: metadata,
          callback: (response: any) => {
            onSuccess(response.reference);
            setLoading(false);
          },
          onClose: () => {
            onClose();
            setLoading(false);
          }
        };

        // If there's a subaccount (referral), add split payment
        if (subaccount) {
          paystackOptions.subaccount = subaccount;
          paystackOptions.transaction_charge = 0; // Let Paystack use subaccount percentage
          paystackOptions.bearer = 'subaccount'; // Affiliate bears the fee
        }

        // @ts-ignore
        const handler = window.PaystackPop.setup(paystackOptions);
        handler.openIframe();
      } catch (err) {
        setError('Failed to initialize payment');
        setLoading(false);
      }
    };
    
    script.onerror = () => {
      setError('Failed to load Paystack');
      setLoading(false);
    };
    
    document.body.appendChild(script);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={initializePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
      >
        {loading ? 'Loading Paystack...' : 'Pay Now'}
      </button>

      {subaccount && (
        <p className="text-xs text-green-600 mt-2 text-center">
          🤝 10% will go to the person who referred you
        </p>
      )}
    </div>
  );
}