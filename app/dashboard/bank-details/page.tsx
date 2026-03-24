'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Bank {
  name: string;
  code: string;
}

export default function BankDetailsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: ''
  });

  // Fetch banks from Paystack
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('https://api.paystack.co/bank?currency=NGN');
        const data = await response.json();
        if (data.status) {
          setBanks(data.data);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        // Fallback banks
        setBanks([
          { name: 'Access Bank', code: '044' },
          { name: 'GTBank', code: '058' },
          { name: 'Palmpay', code: '999991' },
          { name: 'OPay', code: '999992' },
          { name: 'Moniepoint', code: '999993' }
        ]);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);

      const bankDoc = await getDoc(doc(db, 'bankDetails', user.uid));
      if (bankDoc.exists()) {
        const data = bankDoc.data();
        setBankDetails({
          accountName: data.accountName || '',
          accountNumber: data.accountNumber || '',
          bankName: data.bankName || '',
          bankCode: data.bankCode || ''
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
  if (!user) return;
  
  setSaving(true);
  try {
    // Just save to Firestore
    await setDoc(doc(db, 'bankDetails', user.uid), {
      ...bankDetails,
      userId: user.uid,
      userEmail: user.email,
      updatedAt: new Date()
    });

    alert('✅ Bank details saved! Withdrawals will be processed manually.');
    router.push('/dashboard');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to save bank details');
  } finally {
    setSaving(false);
  }
};

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black mb-8">Bank Details</h1>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-600 mb-6">Add your Nigerian bank details to receive your referral earnings automatically.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Name *</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Number *</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bank *</label>
                <select
                  value={bankDetails.bankCode}
                  onChange={(e) => {
                    const selected = banks.find(b => b.code === e.target.value);
                    setBankDetails({
                      ...bankDetails,
                      bankCode: e.target.value,
                      bankName: selected?.name || ''
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                  disabled={loadingBanks}
                >
                  <option value="">{loadingBanks ? 'Loading banks...' : 'Select your bank'}</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-700">
                  💰 <span className="font-semibold">Automatic Withdrawals:</span> Your referral earnings will be sent directly to this bank account when you request withdrawal.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-black text-white py-4 rounded-xl font-semibold mt-4 hover:bg-gray-800 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}