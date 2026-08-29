'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Influencer {
  id: string;
  uid: string;
  email: string;
  influencerName: string;
  influencerBio: string;
  influencerImage?: string;
  referralCode: string;
  totalEarnings: number;
  totalReferrals: number;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export default function AdminInfluencersPage() {
  const [loading, setLoading] = useState(true);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    influencerName: '',
    influencerBio: '',
    influencerImage: '',
    instagram: '',
    tiktok: '',
    twitter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      const q = query(collection(db, 'users'), where('influencer', '==', true));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Influencer[];
      setInfluencers(data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      // Create user in Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const uid = userCredential.user.uid;
      const referralCode = uid.slice(0, 6).toUpperCase();

      // Create influencer document in Firestore
      const influencerData = {
        uid,
        email: formData.email,
        role: 'influencer',
        influencer: true,
        influencerName: formData.influencerName,
        influencerBio: formData.influencerBio || 'Sneaker influencer | Fashion lover',
        influencerImage: formData.influencerImage || '',
        referralCode,
        totalEarnings: 0,
        totalReferrals: 0,
        socialLinks: {
          instagram: formData.instagram || '',
          tiktok: formData.tiktok || '',
          twitter: formData.twitter || ''
        },
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', uid), influencerData);

      setMessage(`✅ Influencer created! 
        Email: ${formData.email}
        Password: ${formData.password}
        Profile: /influencer/${formData.influencerName}`);

      setFormData({
        email: '',
        password: '',
        influencerName: '',
        influencerBio: '',
        influencerImage: '',
        instagram: '',
        tiktok: '',
        twitter: ''
      });
      setShowForm(false);
      fetchInfluencers();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteInfluencer = async (uid: string) => {
    if (!confirm('Delete this influencer?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      fetchInfluencers();
    } catch (error) {
      console.error('Error deleting influencer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Influencers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          {showForm ? 'Cancel' : '+ Add Influencer'}
        </button>
      </div>

      {/* Create Influencer Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4">Create New Influencer</h2>
          
          {message && (
            <div className="mb-4 p-4 rounded-lg whitespace-pre-line" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreateInfluencer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username * (appears in URL)</label>
              <input
                type="text"
                required
                value={formData.influencerName}
                onChange={(e) => setFormData({...formData, influencerName: e.target.value.toLowerCase().replace(/\s/g, '')})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="johndoe"
              />
              <p className="text-xs opacity-60 mt-1">URL: /influencer/{formData.influencerName || 'username'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <input
                type="text"
                value={formData.influencerBio}
                onChange={(e) => setFormData({...formData, influencerBio: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Sneaker influencer | Fashion lover"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Image URL</label>
              <input
                type="url"
                value={formData.influencerImage}
                onChange={(e) => setFormData({...formData, influencerImage: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://instagram.com/@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TikTok</label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://tiktok.com/@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Twitter/X</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://twitter.com/@username"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Influencer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Influencers List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Influencer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Username</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Sales</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Earnings</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Profile Link</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {influencers.map((inf) => (
                <tr key={inf.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {inf.influencerImage && (
                        <img src={inf.influencerImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <span className="font-medium">{inf.influencerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">@{inf.influencerName}</td>
                  <td className="py-4 px-6">{inf.totalReferrals || 0}</td>
                  <td className="py-4 px-6 font-bold text-green-600">₦{(inf.totalEarnings || 0).toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <a 
                      href={`/influencer/${inf.influencerName}`} 
                      target="_blank"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Page →
                    </a>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => deleteInfluencer(inf.uid)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {influencers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No influencers created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}