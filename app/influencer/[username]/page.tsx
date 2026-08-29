'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

function InfluencerPageContent() {
  const params = useParams();
  const username = params.username as string;
  const [loading, setLoading] = useState(true);
  const [influencer, setInfluencer] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && influencer?.referralCode) {
      setReferralLink(`${window.location.origin}/?ref=${influencer.referralCode}`);
    }
  }, [influencer]);

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('influencerName', '==', username),
          where('influencer', '==', true)
        );
        const usersSnapshot = await getDocs(usersQuery);
        if (usersSnapshot.empty) {
          setLoading(false);
          return;
        }
        const userData = usersSnapshot.docs[0].data();
        setInfluencer(userData);

        const ordersQuery = query(
          collection(db, 'orders'),
          where('referralCode', '==', userData.referralCode)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        setReferrals(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    fetchInfluencer();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Not Found</h1>
          <Link href="/" className="mt-4 inline-block px-6 py-3 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}>Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
            {influencer.influencerImage ? (
              <Image src={influencer.influencerImage} alt={influencer.influencerName} width={128} height={128} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
            )}
          </div>
          <h1 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>{influencer.influencerName}</h1>
          <p className="opacity-70 mt-2">{influencer.influencerBio || 'Sneaker lover | Fashion enthusiast'}</p>
          
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <p className="text-2xl font-bold text-green-600">{referrals.length}</p>
              <p className="text-sm opacity-60">Shoes Sold</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">₦{(referrals.length * 2000).toLocaleString()}</p>
              <p className="text-sm opacity-60">Earned</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg mt-8" style={{ backgroundColor: 'var(--card)' }}>
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>🔗 Shop with {influencer.influencerName}</h2>
            <p className="text-sm opacity-70 mb-4">You earn ₦2,000 per sale!</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={referralLink || ''}
                readOnly
                className="flex-1 px-4 py-3 rounded-xl border focus:outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <button
                onClick={() => {
                  const link = `${window.location.origin}/?ref=${influencer.referralCode}`;
                  navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-6 py-3 rounded-xl font-semibold transition"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
              >
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Disable SSR for this page
const InfluencerPage = dynamic(
  () => Promise.resolve(InfluencerPageContent),
  { ssr: false }
);

export default InfluencerPage;