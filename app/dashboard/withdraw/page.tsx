'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const WITHDRAWAL_FEE = 100;

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);

      // Get user's earnings
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTotalEarnings(userData.totalEarnings || 0);
        console.log('💰 Balance from Firebase:', userData.totalEarnings);
      }

      // Check if user has bank details
      const bankDoc = await getDoc(doc(db, 'bankDetails', user.uid));
      if (bankDoc.exists()) {
        setBankDetails(bankDoc.data());
        setHasBankDetails(true);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleWithdraw = async () => {
    if (!hasBankDetails) {
      alert('Please add your bank details first');
      router.push('/dashboard/bank-details');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 50) {
      alert('Minimum withdrawal amount is ₦50');
      return;
    }

    if (amount > totalEarnings) {
      alert(`You cannot withdraw more than your available earnings (₦${totalEarnings.toLocaleString()})`);
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/request-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount: amount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Withdrawal request submitted! ₦${amount} will be processed.`);
        router.push('/dashboard?refresh=true');
      } else {
        alert(data.error || 'Failed to request withdrawal');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to request withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center opacity-70 hover:opacity-100 mb-6 transition" style={{ color: 'var(--foreground)' }}>
            ← Back to Dashboard
          </Link>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Withdraw Earnings</h1>
            <p className="mt-2 opacity-70">Transfer your referral earnings to your bank</p>
          </div>

          {/* Balance Card */}
          <div className="rounded-2xl shadow-lg p-6 mb-6 text-center" style={{ backgroundColor: 'var(--card)' }}>
            <p className="text-sm opacity-70">Available Balance</p>
            <p className="text-5xl font-bold text-green-600 dark:text-green-400 mt-2">₦{totalEarnings.toLocaleString()}</p>
            <p className="text-xs opacity-50 mt-2">Min withdrawal: ₦50 | Fee: ₦{WITHDRAWAL_FEE}</p>
          </div>

          {/* Bank Details */}
          <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${hasBankDetails ? 'border' : ''}`} style={{ backgroundColor: hasBankDetails ? 'var(--card)' : 'var(--background)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: hasBankDetails ? 'var(--background)' : 'var(--card)' }}>
              {hasBankDetails ? '🏦' : '⚠️'}
            </div>
            <div className="flex-1">
              {hasBankDetails ? (
                <>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>Bank details saved</p>
                  <p className="text-xs opacity-60">{bankDetails?.bankName} - {bankDetails?.accountNumber}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">No bank details found</p>
                  <Link href="/dashboard/bank-details" className="text-xs underline opacity-70">
                    Add bank details to withdraw →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Withdraw Form */}
          {hasBankDetails && (
            <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: 'var(--card)' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Amount (₦)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              
              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[100, 200, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setWithdrawAmount(preset.toString())}
                    disabled={preset + WITHDRAWAL_FEE > totalEarnings}
                    className="px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                    style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)`, color: 'var(--foreground)' }}
                  >
                    ₦{preset}
                  </button>
                ))}
                <button
                  onClick={() => setWithdrawAmount((totalEarnings - WITHDRAWAL_FEE).toString())}
                  disabled={totalEarnings - WITHDRAWAL_FEE < 50}
                  className="px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                  style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)`, color: 'var(--foreground)' }}
                >
                  Max
                </button>
              </div>

              {/* Fee Breakdown */}
              {withdrawAmount && parseFloat(withdrawAmount) >= 50 && parseFloat(withdrawAmount) + WITHDRAWAL_FEE <= totalEarnings && (
                <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Withdrawal amount:</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>₦{parseFloat(withdrawAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                    <span>Withdrawal fee:</span>
                    <span>- ₦{WITHDRAWAL_FEE}</span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--border)' }}>
                    <span>You'll receive:</span>
                    <span className="text-green-600 dark:text-green-400">₦{parseFloat(withdrawAmount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) + WITHDRAWAL_FEE > totalEarnings || parseFloat(withdrawAmount) < 50}
                className="w-full py-4 rounded-xl font-semibold mt-6 transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
              >
                {processing ? 'Processing...' : `Withdraw ₦${withdrawAmount || '0'}`}
              </button>

              <p className="text-xs text-center mt-4 opacity-50">
                Withdrawals are processed within 24-48 hours. ₦{WITHDRAWAL_FEE} fee applies.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}