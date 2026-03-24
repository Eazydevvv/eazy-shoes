'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc, limit } from 'firebase/firestore';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  brand?: string;
  images?: string[];
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  fee?: number;
  requestedAt?: any;
  paidAt?: any;
}

interface Order {
  id: string;
  orderReference?: string;
  totalAmount?: number;
  status?: string;
  products?: any[];
  createdAt?: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productLinkCopied, setProductLinkCopied] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(false);

  const fetchUserData = async (user: any) => {
  // Get user's referral code and data
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    let currentReferralCode = userData.referralCode;
    
    if (!currentReferralCode) {
      const newReferralCode = user.uid.slice(0, 6).toUpperCase();
      await updateDoc(doc(db, 'users', user.uid), {
        referralCode: newReferralCode,
        totalEarnings: 0,
        totalReferrals: 0
      });
      currentReferralCode = newReferralCode;
    }
    
    setReferralCode(currentReferralCode);
    
    // READ BALANCE FROM USER DOCUMENT
    const currentBalance = userData.totalEarnings || 0;
    setTotalEarnings(currentBalance);
    
    // Get referral count
    const referredOrdersQuery = query(
      collection(db, 'orders'),
      where('referralCode', '==', currentReferralCode),
      orderBy('createdAt', 'desc')
    );
    const referredOrdersSnapshot = await getDocs(referredOrdersQuery);
    setReferralCount(referredOrdersSnapshot.size);
  }

  // Fetch user's own orders
  const ordersQuery = query(
    collection(db, 'orders'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const ordersSnapshot = await getDocs(ordersQuery);
  const userOrders: Order[] = [];
  ordersSnapshot.forEach(doc => {
    const data = doc.data();
    userOrders.push({
      id: doc.id,
      orderReference: data.orderReference,
      totalAmount: data.totalAmount || 0,
      status: data.status || 'pending',
      products: data.products || [],
      createdAt: data.createdAt
    });
  });
  setOrders(userOrders);

  // Fetch withdrawal history
  // Fetch withdrawal history
const withdrawalsQuery = query(
  collection(db, 'withdrawals'),
  where('userId', '==', user.uid),
  orderBy('requestedAt', 'desc')
);
const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
const withdrawalData: any[] = [];
withdrawalsSnapshot.forEach(doc => {
  const data = doc.data();
  withdrawalData.push({
    id: doc.id,
    amount: data.amount || 0,
    status: data.status || 'pending',
    fee: data.fee || 0,
    requestedAt: data.requestedAt,
    paidAt: data.paidAt
  });
});
setWithdrawals(withdrawalData);

// Calculate pending withdrawal amount
let pending = 0;
withdrawalData.forEach((w: any) => {
  if (w.status === 'pending') pending += w.amount;
});
setPendingWithdrawal(pending);
  // Fetch products
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const productsData: Product[] = [];
  productsSnapshot.forEach(doc => {
    const data = doc.data();
    productsData.push({
      id: doc.id,
      name: data.name || '',
      price: data.price || 0,
      brand: data.brand,
      images: data.images || []
    });
  });
  setProducts(productsData);
};

  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh === 'true') {
      router.replace('/dashboard');
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);
      await fetchUserData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const getProductReferralLink = (productId: string) => {
    if (!referralCode) return `${window.location.origin}/product/${productId}`;
    return `${window.location.origin}/product/${productId}?ref=${referralCode}`;
  };

  const copyProductLink = () => {
    if (!selectedProduct) return;
    const link = getProductReferralLink(selectedProduct);
    navigator.clipboard.writeText(link);
    setProductLinkCopied(true);
    setTimeout(() => setProductLinkCopied(false), 2000);
    alert('✅ Link copied!');
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'delivered': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-black to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">{user?.email?.[0]?.toUpperCase() || '👤'}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Sneakerhead'}! 👟</h1>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">Referral code: <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded">{referralCode}</span></p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold mt-1">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Referrals</p>
                  <p className="text-2xl font-bold mt-1">{referralCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Balance</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₦{totalEarnings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">₦{pendingWithdrawal.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm opacity-80">Available Balance</p>
                <p className="text-4xl font-bold mt-1">₦{totalEarnings.toLocaleString()}</p>
                <p className="text-sm mt-2 opacity-80">Min withdrawal: ₦50 | Fee: ₦100</p>
              </div>
              <Link
                href="/dashboard/withdraw"
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  totalEarnings >= 150 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                {totalEarnings >= 150 ? '💸 Withdraw Now' : `Need ₦150 (₦50 + ₦100 fee)`}
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20">
              <Link 
                href="/dashboard/bank-details"
                className="inline-flex items-center bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
              >
                <span className="mr-2">🏦</span>
                Bank Details
              </Link>
              
              <button
                onClick={() => setShowWithdrawalHistory(!showWithdrawalHistory)}
                className="inline-flex items-center bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition text-sm"
              >
                {showWithdrawalHistory ? '▼ Hide History' : '▶ View History'}
              </button>
            </div>
          </div>

          {/* Withdrawal History */}
          {showWithdrawalHistory && withdrawals.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">📋 Withdrawal History</h2>
              <div className="space-y-3">
                {withdrawals.map((w, idx) => (
                  <div key={`${w.id}-${idx}`} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-semibold">₦{w.amount.toLocaleString()}</p>
                      {w.fee && <p className="text-xs text-gray-400">Fee: ₦{w.fee}</p>}
                      <p className="text-sm text-gray-500">
                        {w.requestedAt?.toDate ? new Date(w.requestedAt.toDate()).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(w.status)}`}>
                        {w.status === 'pending' ? '⏳ Pending' : w.status === 'paid' ? '✅ Paid' : '❌ Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral Link Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-3">🎯 Share a Specific Shoe</h2>
            <p className="text-sm mb-4">Choose a shoe to get a direct referral link. You earn 10% when someone buys it!</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-black bg-white"
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₦{product.price.toLocaleString()}
                  </option>
                ))}
              </select>
              
              <button
                onClick={copyProductLink}
                disabled={!selectedProduct}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {productLinkCopied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>

            {selectedProductData && (
              <div className="mt-4 bg-white/10 rounded-xl p-3">
                <p className="text-xs break-all">
                  Link: <span className="font-mono">{getProductReferralLink(selectedProduct)}</span>
                </p>
                {selectedProductData.images?.[0] && (
                  <a
                    href={selectedProductData.images[0]}
                    download={`${selectedProductData.name.replace(/\s/g, '-')}.jpg`}
                    className="inline-block mt-3 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs transition"
                  >
                    📥 Download Image
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">📦 Recent Orders</h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders yet.</p>
                <Link href="/products" className="text-black underline">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <div key={`${order.id}-${idx}`} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-medium">{order.products?.[0]?.productName || 'Product'}</p>
                      <p className="text-sm text-gray-500">
                        {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₦{order.totalAmount?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.status || 'pending')}`}>
                        {order.status || 'pending'}
                      </span>
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