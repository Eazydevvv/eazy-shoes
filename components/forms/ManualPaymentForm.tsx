'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ManualPaymentForm({ orderId, totalAmount }: { orderId: string; totalAmount: number }) {
  const [uploading, setUploading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      alert('Please upload a screenshot of your payment');
      return;
    }

    setUploading(true);

    // Convert screenshot to base64 for storage (simplified)
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Here you would save to Firebase
      alert('Payment proof submitted! Your order will be confirmed within 30 minutes.');
      router.push('/order-success');
    };
    reader.readAsDataURL(screenshot);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">💳 Manual Payment</h2>
      
      <div className="bg-white p-4 rounded-xl mb-4">
        <p className="text-sm text-gray-600">Send payment to:</p>
        <p className="font-bold text-lg">08073042250</p>
        <p className="text-sm">PalmPay - Israel Olalere</p>
        <p className="text-sm font-bold mt-2">Amount: ₦{totalAmount.toLocaleString()}</p>
      </div>

      <form onSubmit={handleUpload}>
        <label className="block text-sm font-medium mb-2">Upload Payment Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
          className="w-full mb-4"
          required
        />
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold"
        >
          {uploading ? 'Submitting...' : 'Submit Payment Proof'}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 mt-4">
        After payment, upload screenshot. We'll confirm within 30 minutes.
      </p>
    </div>
  );
}