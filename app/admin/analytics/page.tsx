'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      let revenue = 0;
      ordersSnap.forEach(doc => revenue += doc.data().totalAmount || 0);
      const usersSnap = await getDocs(collection(db, 'users'));
      setStats({ orders: ordersSnap.size, revenue, users: usersSnap.size });
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Total Orders</p><p className="text-3xl font-bold">{stats.orders}</p></div>
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Revenue</p><p className="text-3xl font-bold text-green-600">₦{stats.revenue.toLocaleString()}</p></div>
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Total Users</p><p className="text-3xl font-bold">{stats.users}</p></div>
      </div>
    </div>
  );
}