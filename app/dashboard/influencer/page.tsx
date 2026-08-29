'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

function InfluencerDashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [influencerData, setInfluencerData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [totalReferred, setTotalReferred] = useState(0);
  const [profileUrl, setProfileUrl] = useState('');
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/?ref=${referralCode}`);
      if (influencerData?.influencerName) {
        setProfileUrl(`${window.location.origin}/influencer/${influencerData.influencerName}`);
      }
    }
  }, [referralCode, influencerData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();

        if (!data?.influencer) {
          router.push('/dashboard');
          return;
        }

        setUser(user);
        setInfluencerData(data);
        
        const code = data.referralCode || user.uid.slice(0, 6).toUpperCase();
        setReferralCode(code);

        const usersQuery = query(
          collection(db, 'users'),
          where('referredBy', '==', code)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const referredUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setTotalReferred(referredUsers.length);

        const ordersQuery = query(
          collection(db, 'orders'),
          where('referralCode', '==', code),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReferrals(orders);
        setTotalEarnings(orders.length * 2000);

        setLoading(false);
      } catch (error) {
        console.error('Error loading influencer data:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!influencerData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <p className="opacity-70">No influencer data found</p>
          <Link href="/dashboard" className="mt-4 inline-block px-6 py-3 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Influencer Dashboard</h1>
            <p className="opacity-70 mt-1">Welcome, {influencerData?.influencerName || user?.email}</p>
            <p className="text-xs opacity-50 mt-1">Your referral code: <span className="font-mono font-bold">{referralCode}</span></p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="rounded-2xl p-4 md:p-6 shadow-lg text-center" style={{ backgroundColor: 'var(--card)' }}>
              <p className="text-sm opacity-70">Total Referred</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{totalReferred}</p>
            </div>
            <div className="rounded-2xl p-4 md:p-6 shadow-lg text-center" style={{ backgroundColor: 'var(--card)' }}>
              <p className="text-sm opacity-70">Total Sales</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{referrals.length}</p>
            </div>
            <div className="rounded-2xl p-4 md:p-6 shadow-lg text-center" style={{ backgroundColor: 'var(--card)' }}>
              <p className="text-sm opacity-70">Profile Views</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>0</p>
            </div>
            <div className="rounded-2xl p-4 md:p-6 shadow-lg text-center" style={{ backgroundColor: 'var(--card)' }}>
              <p className="text-sm opacity-70">Earnings</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">₦{totalEarnings.toLocaleString()}</p>
            </div>
          </div>

          {profileUrl && (
            <div className="rounded-2xl p-6 mb-8 shadow-lg" style={{ backgroundColor: 'var(--card)' }}>
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>📱 Your Public Profile</h2>
              <p className="text-sm opacity-70 mb-3">Share this link with your audience:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border focus:outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(profileUrl);
                      alert('✅ Profile link copied!');
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
                >
                  📋 Copy Profile
                </button>
              </div>
            </div>
          )}

          {referralLink && (
            <div className="rounded-2xl p-6 mb-8 shadow-lg" style={{ backgroundColor: 'var(--card)' }}>
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>🔗 Your Referral Link</h2>
              <p className="text-sm opacity-70 mb-4">Share this link with your audience. You earn ₦2,000 per shoe sold!</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border focus:outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(referralLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>
              <p className="text-xs opacity-50 mt-3">Your code: <span className="font-mono font-bold">{referralCode}</span></p>
            </div>
          )}

          {totalEarnings >= 50 && (
            <div className="rounded-2xl p-6 mb-8 shadow-lg text-center" style={{ backgroundColor: 'var(--card)' }}>
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>💰 Withdraw Earnings</h2>
              <p className="text-sm opacity-70 mb-4">
                You have ₦{totalEarnings.toLocaleString()} available to withdraw.
              </p>
              <Link
                href="/dashboard/withdraw"
                className="inline-block px-6 py-3 rounded-xl font-semibold transition"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
              >
                Withdraw Now
              </Link>
              <p className="text-xs opacity-50 mt-3">Minimum withdrawal: ₦50</p>
            </div>
          )}

          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--card)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>📋 Recent Referrals</h2>
            {referrals.length === 0 ? (
              <p className="text-center py-8 opacity-70">No referrals yet. Share your link!</p>
            ) : (
              <div className="space-y-3">
                {referrals.map((order, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="font-medium">{order.products?.[0]?.productName || 'Product'}</p>
                      <p className="text-xs opacity-50">
                        {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+₦2,000</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Disable SSR for this page
const InfluencerDashboard = dynamic(
  () => Promise.resolve(InfluencerDashboardContent),
  { ssr: false }
);

export default InfluencerDashboard;