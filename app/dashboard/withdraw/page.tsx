'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const WITHDRAWAL_FEE = 100;

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [hasBank, setHasBank] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);

      // Get balance
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setBalance(userDoc.data().totalEarnings || 0);
      }

      // Check bank details
      const bankDoc = await getDoc(doc(db, 'bankDetails', user.uid));
      if (bankDoc.exists()) {
        setHasBank(true);
        setBankDetails(bankDoc.data());
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount < 50) {
      alert('Minimum withdrawal is ₦50');
      return;
    }
    
    const totalNeeded = withdrawAmount + WITHDRAWAL_FEE;
    
    if (totalNeeded > balance) {
      alert(`Insufficient funds. Need ₦${totalNeeded} (₦${withdrawAmount} + ₦${WITHDRAWAL_FEE} fee). Balance: ₦${balance}`);
      return;
    }

    if (!hasBank) {
      alert('Please add bank details first');
      router.push('/dashboard/bank-details');
      return;
    }

    setProcessing(true);
    
    try {
      const response = await fetch('/api/request-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, amount: withdrawAmount })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Withdrawal of ₦${withdrawAmount} submitted! Fee: ₦${WITHDRAWAL_FEE}. New balance: ₦${data.newBalance}`);
        router.push('/dashboard?refresh=true');
      } else {
        alert(data.error || 'Failed to request withdrawal');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-black mb-6">
            ← Back to Dashboard
          </Link>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold">Withdraw Earnings</h1>
            <p className="text-gray-500 mt-2">Transfer your referral earnings to your bank</p>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <p className="text-gray-500 text-sm">Available Balance</p>
            <p className="text-5xl font-bold text-green-600 mt-2">₦{balance.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">Minimum withdrawal: ₦50 | Fee: ₦{WITHDRAWAL_FEE}</p>
          </div>

          {/* Bank Details */}
          <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${
            hasBank ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              hasBank ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {hasBank ? '🏦' : '⚠️'}
            </div>
            <div className="flex-1">
              {hasBank ? (
                <>
                  <p className="text-green-700 font-medium">Bank details saved</p>
                  <p className="text-xs text-green-600">{bankDetails?.bankName} - {bankDetails?.accountNumber}</p>
                </>
              ) : (
                <>
                  <p className="text-yellow-700 font-medium">No bank details found</p>
                  <Link href="/dashboard/bank-details" className="text-xs text-yellow-600 underline">
                    Add bank details to withdraw →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Withdraw Form */}
          {hasBank && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              
              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[100, 200, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    disabled={preset + WITHDRAWAL_FEE > balance}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      preset + WITHDRAWAL_FEE <= balance
                        ? 'border border-gray-300 hover:border-black'
                        : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ₦{preset}
                  </button>
                ))}
                <button
                  onClick={() => setAmount((balance - WITHDRAWAL_FEE).toString())}
                  disabled={balance - WITHDRAWAL_FEE < 50}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    balance - WITHDRAWAL_FEE >= 50
                      ? 'border border-gray-300 hover:border-black'
                      : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Max
                </button>
              </div>

              {/* Fee Breakdown */}
              {amount && parseFloat(amount) >= 50 && parseFloat(amount) + WITHDRAWAL_FEE <= balance && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Withdrawal amount:</span>
                    <span className="font-semibold">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Withdrawal fee:</span>
                    <span>- ₦{WITHDRAWAL_FEE}</span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>You'll receive:</span>
                    <span className="text-green-600">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={processing || !amount || parseFloat(amount) + WITHDRAWAL_FEE > balance || parseFloat(amount) < 50}
                className="w-full bg-black text-white py-4 rounded-xl font-semibold mt-6 hover:bg-gray-800 transition disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Withdraw ₦${amount || '0'}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Withdrawals are processed within 24-48 hours. ₦{WITHDRAWAL_FEE} fee applies.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}