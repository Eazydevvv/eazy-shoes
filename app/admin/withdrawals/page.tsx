'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const q = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWithdrawals(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (withdrawalId: string, userId: string, amount: number) => {
    if (!confirm(`Mark ₦${amount} withdrawal as paid?`)) return;
    
    try {
      // Update withdrawal status
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'paid',
        paidAt: new Date()
      });
      
      // Update user's pending withdrawal
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
      
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        await updateDoc(doc(db, 'users', userId), {
          pendingWithdrawal: (userData.pendingWithdrawal || 0) - amount
        });
      }
      
      alert('✅ Marked as paid');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Withdrawal Requests</h1>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-6">User ID</th>
              <th className="text-left py-4 px-6">Amount</th>
              <th className="text-left py-4 px-6">Bank</th>
              <th className="text-left py-4 px-6">Account</th>
              <th className="text-left py-4 px-6">Date</th>
              <th className="text-left py-4 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="py-4 px-6">{w.userId?.slice(0, 8)}...</td>
                <td className="py-4 px-6 font-bold text-green-600">₦{w.amount}</td>
                <td className="py-4 px-6">{w.bankDetails?.bankName}</td>
                <td className="py-4 px-6">{w.bankDetails?.accountNumber}</td>
                <td className="py-4 px-6">
                  {new Date(w.requestedAt?.toDate()).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => markAsPaid(w.id, w.userId, w.amount)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {withdrawals.length === 0 && (
          <p className="text-center py-8 text-gray-500">No pending withdrawals</p>
        )}
      </div>
    </div>
  );
}