'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
    totalCommission: 0
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let revenue = 0;
        let commission = 0;
        const productSales: { [key: string]: { name: string; count: number; total: number } } = {};
        
        ordersSnap.forEach(doc => {
          const data = doc.data();
          revenue += data.totalAmount || 0;
          commission += data.commission || 0;
          
          // Track product sales
          if (data.products) {
            data.products.forEach((p: any) => {
              if (!productSales[p.productId]) {
                productSales[p.productId] = { name: p.productName, count: 0, total: 0 };
              }
              productSales[p.productId].count += p.quantity;
              productSales[p.productId].total += p.price * p.quantity;
            });
          }
        });

        // Get users
        const usersSnap = await getDocs(collection(db, 'users'));
        
        // Get products
        const productsSnap = await getDocs(collection(db, 'products'));

        // Top products
        const top = Object.values(productSales)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          orders: ordersSnap.size,
          revenue,
          users: usersSnap.size,
          products: productsSnap.size,
          totalCommission: commission
        });
        setTopProducts(top);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{stats.orders}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-6">
          <p className="text-sm text-green-600">Revenue</p>
          <p className="text-2xl font-bold text-green-600">₦{stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow p-6">
          <p className="text-sm text-blue-600">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow p-6">
          <p className="text-sm text-purple-600">Products</p>
          <p className="text-2xl font-bold text-purple-600">{stats.products}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-6">
          <p className="text-sm text-yellow-600">Commission Paid</p>
          <p className="text-2xl font-bold text-yellow-600">₦{stats.totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">🏆 Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-gray-500">No products sold yet</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{['🥇','🥈','🥉','4️⃣','5️⃣'][index]}</span>
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.count} units sold</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">₦{product.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}