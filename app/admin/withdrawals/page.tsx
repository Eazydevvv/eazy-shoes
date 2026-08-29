'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  requestedAt: any;
  paidAt?: any;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const q = query(collection(db, 'withdrawals'), orderBy('requestedAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Withdrawal[];
      setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (withdrawalId: string, userId: string, amount: number) => {
    if (!confirm(`Mark ₦${amount.toLocaleString()} withdrawal as paid?`)) return;
    
    setProcessing(withdrawalId);
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'paid',
        paidAt: new Date()
      });
      
      // Update user's pending withdrawal amount (optional)
      const userRef = doc(db, 'users', userId);
      // You can track user's total withdrawn amount if needed
      
      alert('✅ Withdrawal marked as paid');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const filteredWithdrawals = filter === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === filter);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);
  const totalPaid = withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.amount, 0);

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
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:border-black outline-none"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Withdrawals</p>
          <p className="text-2xl font-bold">{withdrawals.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-4">
          <p className="text-sm text-yellow-600">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600">₦{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4">
          <p className="text-sm text-green-600">Paid Amount</p>
          <p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">User ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Bank Details</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Request Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-mono text-sm">
                    {w.userId?.slice(0, 8)}...
                  </td>
                  <td className="py-4 px-6 font-bold text-green-600">₦{w.amount.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium">{w.bankDetails?.bankName}</div>
                      <div className="text-gray-500">{w.bankDetails?.accountNumber}</div>
                      <div className="text-gray-400 text-xs">{w.bankDetails?.accountName}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {w.requestedAt?.toDate ? new Date(w.requestedAt.toDate()).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(w.status)}`}>
                      {w.status === 'pending' ? '⏳ Pending' : '✅ Paid'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {w.status === 'pending' && (
                      <button
                        onClick={() => markAsPaid(w.id, w.userId, w.amount)}
                        disabled={processing === w.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing === w.id ? 'Processing...' : 'Mark Paid'}
                      </button>
                    )}
                    {w.status === 'paid' && w.paidAt && (
                      <span className="text-xs text-gray-400">
                        Paid: {new Date(w.paidAt.toDate()).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWithdrawals.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No withdrawal requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}