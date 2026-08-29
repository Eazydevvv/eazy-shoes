'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, setDoc, getDocs, orderBy, doc, getDoc, updateDoc, limit } from 'firebase/firestore';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    brand?: string;
    images?: string[];
}

interface Order {
    id: string;
    orderReference?: string;
    totalAmount?: number;
    status?: string;
    products?: any[];
    createdAt?: any;
}

function DashboardContent() {
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
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(false);
    const [userRole, setUserRole] = useState('');

    const fetchUserData = async (user: any) => {
    try {
        console.log('🔍 Fetching user data for:', user.uid);
        
        const userRef = doc(db, 'users', user.uid);
        let userDoc = await getDoc(userRef);

        // If user document doesn't exist, create it
        if (!userDoc.exists()) {
            console.log('⚠️ User document not found, creating...');
            const newReferralCode = user.uid.slice(0, 6).toUpperCase();
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                referralCode: newReferralCode,
                role: 'user',
                createdAt: new Date(),
                totalEarnings: 0,
                totalReferrals: 0
            });
            userDoc = await getDoc(userRef);
            console.log('✅ User document created');
        }

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📄 User data:', userData);
            
            setUserRole(userData.role || '');
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
            const currentBalance = userData.totalEarnings || 0;
            setTotalEarnings(currentBalance);

            const referredOrdersQuery = query(
                collection(db, 'orders'),
                where('referralCode', '==', currentReferralCode),
                orderBy('createdAt', 'desc')
            );
            const referredOrdersSnapshot = await getDocs(referredOrdersQuery);
            setReferralCount(referredOrdersSnapshot.size);
        }

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

        let pending = 0;
        for (let i = 0; i < withdrawalData.length; i++) {
            if (withdrawalData[i].status === 'pending') {
                pending += withdrawalData[i].amount;
            }
        }
        setPendingWithdrawal(pending);

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
        
    } catch (err: any) {
        console.error('Error fetching user data:', err);
    }
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
        if (typeof window === 'undefined') return '';
        if (!referralCode) return `${window.location.origin}/product/${productId}`;
        return `${window.location.origin}/product/${productId}?ref=${referralCode}`;
    };

    const copyProductLink = () => {
        if (!selectedProduct) return;
        const link = getProductReferralLink(selectedProduct);
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(link);
        }
        setProductLinkCopied(true);
        setTimeout(() => setProductLinkCopied(false), 2000);
        alert('✅ Link copied!');
    };

    const handleShowHistory = () => {
        setShowWithdrawalHistory(!showWithdrawalHistory);
    };

    const selectedProductData = products.find(p => p.id === selectedProduct);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    if (!user) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
            case 'delivered': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
                        <p className="opacity-70 text-sm mt-1">Welcome back, {user?.displayName || user?.email?.split('@')[0]}</p>
                        <p className="text-xs opacity-50 mt-1">Referral code: <span className="font-mono font-bold">{referralCode}</span></p>
                    </div>

                    {/* Show creator dashboard link if user is creator */}
                    {userRole === 'influencer' && (
                        <div className="mb-6">
                            <Link
                                href="/dashboard/influencer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition"
                                style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
                            >
                                🌟 Go to Influencer Dashboard
                            </Link>
                        </div>
                    )}
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="rounded-lg shadow p-5" style={{ backgroundColor: 'var(--card)' }}>
                            <p className="text-sm opacity-70">Orders</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{orders.length}</p>
                        </div>
                        <div className="rounded-lg shadow p-5" style={{ backgroundColor: 'var(--card)' }}>
                            <p className="text-sm opacity-70">Referrals</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{referralCount}</p>
                        </div>
                        <div className="rounded-lg shadow p-5" style={{ backgroundColor: 'var(--card)' }}>
                            <p className="text-sm opacity-70">Balance</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₦{totalEarnings.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg shadow p-5" style={{ backgroundColor: 'var(--card)' }}>
                            <p className="text-sm opacity-70">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">₦{pendingWithdrawal.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Withdrawal Section */}
                    <div className="rounded-lg shadow p-6 mb-8" style={{ backgroundColor: 'var(--card)' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-sm opacity-70">Available Balance</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">₦{totalEarnings.toLocaleString()}</p>
                                <p className="text-xs opacity-50 mt-1">Min: ₦50 | Fee: ₦100</p>
                            </div>
                            <Link
                                href="/dashboard/withdraw"
                                className={`px-6 py-3 rounded-lg font-semibold transition ${totalEarnings >= 150
                                        ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                            >
                                {totalEarnings >= 150 ? 'Withdraw' : `Need ₦150`}
                            </Link>
                        </div>
                        <button
                            onClick={handleShowHistory}
                            className="text-sm opacity-60 hover:opacity-100 mt-4 transition"
                        >
                            {showWithdrawalHistory ? '▼ Hide History' : '▶ View History'}
                        </button>
                    </div>

                    {/* Withdrawal History */}
                    {showWithdrawalHistory && withdrawals.length > 0 && (
                        <div className="rounded-lg shadow p-6 mb-8" style={{ backgroundColor: 'var(--card)' }}>
                            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Withdrawal History</h2>
                            <div className="space-y-3">
                                {withdrawals.map((w, idx) => (
                                    <div key={`${w.id}-${idx}`} className="flex justify-between items-center p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                                        <div>
                                            <p className="font-semibold">₦{w.amount.toLocaleString()}</p>
                                            <p className="text-xs opacity-50">
                                                {w.requestedAt?.toDate ? new Date(w.requestedAt.toDate()).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(w.status)}`}>
                                            {w.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Referral Link Card */}
                    <div className="rounded-lg shadow p-6 mb-8" style={{ backgroundColor: 'var(--card)' }}>
                        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Share a Shoe</h2>
                        <p className="text-sm opacity-70 mb-4">You earn ₦2,000 per shoe when someone buys using your link.</p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
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
                                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-medium hover:opacity-80 transition disabled:opacity-50"
                            >
                                {productLinkCopied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>

                        {selectedProductData && (
                            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                                <p className="text-xs opacity-70 break-all">
                                    Link: {getProductReferralLink(selectedProduct)}
                                </p>
                                {selectedProductData.images?.[0] && (
                                    <a
                                        href={selectedProductData.images[0]}
                                        download
                                        className="inline-block mt-2 text-xs underline opacity-70 hover:opacity-100"
                                    >
                                        Download Image
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--card)' }}>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Recent Orders</h2>

                        {orders.length === 0 ? (
                            <p className="text-center py-4 opacity-70">No orders yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order, idx) => (
                                    <div key={`${order.id}-${idx}`} className="flex justify-between items-center p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                                        <div>
                                            <p className="font-medium">{order.products?.[0]?.productName || 'Product'}</p>
                                            <p className="text-xs opacity-50">
                                                {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₦{order.totalAmount?.toLocaleString()}</p>
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(order.status || 'pending')}`}>
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

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}