'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

interface TopProduct {
  productId: string;
  productName: string;
  referralCount: number;
  totalCommission: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    referrals: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const usersSnap = await getDocs(collection(db, 'users'));
        const referralsSnap = await getDocs(collection(db, 'referrals'));
        
        // Calculate total revenue
        let revenue = 0;
        ordersSnap.forEach(doc => {
          revenue += doc.data().totalAmount || 0;
        });

        setStats({
          products: productsSnap.size,
          orders: ordersSnap.size,
          users: usersSnap.size,
          referrals: referralsSnap.size,
          totalRevenue: revenue
        });

        // Fetch top referred products
        const ordersData: any[] = [];
        ordersSnap.forEach(doc => {
          const data = doc.data();
          if (data.referralCode && data.referredProduct) {
            ordersData.push({
              productId: data.referredProduct,
              productName: data.referredProductName || 'Unknown',
              amount: data.totalAmount
            });
          }
        });

        // Group by product
        const productMap = new Map<string, { count: number; commission: number }>();
        ordersData.forEach(order => {
          const existing = productMap.get(order.productId);
          if (existing) {
            existing.count++;
            existing.commission += order.amount * 0.1;
          } else {
            productMap.set(order.productId, {
              count: 1,
              commission: order.amount * 0.1
            });
          }
        });

        // Convert to array and sort
        const topProductsArray: TopProduct[] = Array.from(productMap.entries()).map(([productId, data]) => ({
          productId,
          productName: ordersData.find(o => o.productId === productId)?.productName || 'Unknown',
          referralCount: data.count,
          totalCommission: data.commission
        }));

        topProductsArray.sort((a, b) => b.referralCount - a.referralCount);
        setTopProducts(topProductsArray.slice(0, 5)); // Top 5 products

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.products, icon: '👟', color: 'bg-blue-500', link: '/admin/products' },
    { title: 'Total Orders', value: stats.orders, icon: '📦', color: 'bg-green-500', link: '/admin/orders' },
    { title: 'Total Users', value: stats.users, icon: '👥', color: 'bg-purple-500', link: '/admin/users' },
    { title: 'Total Referrals', value: stats.referrals, icon: '🤝', color: 'bg-orange-500', link: '/admin/referrals' },
    { title: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-yellow-500', link: '/admin/orders' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.link}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4`}>
              {stat.icon}
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Top Referred Products */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-6">🏆 Top Referred Products</h2>
        
        {topProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No referral sales yet. Share your referral links!</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{product.productName}</p>
                    <p className="text-sm text-gray-500">{product.referralCount} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₦{product.totalCommission.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Commission paid</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products/add"
          className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-3xl mb-3">➕</div>
          <h3 className="font-bold text-lg">Add New Product</h3>
          <p className="text-sm text-gray-300 mt-2">Create a new product listing</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-bold text-lg">View Orders</h3>
          <p className="text-sm text-gray-200 mt-2">Manage pending deliveries</p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-3xl mb-3">🏷️</div>
          <h3 className="font-bold text-lg">Manage Categories</h3>
          <p className="text-sm text-gray-200 mt-2">Add/edit product categories</p>
        </Link>
      </div>
    </div>
  );
}