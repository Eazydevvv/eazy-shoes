'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import PaystackButton from '@/components/payment/PaystackButton';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: number;
  color?: string;
  image?: string;
  referralCode?: string;
}

const COMMISSION_PER_SHOE = 2000; // ₦2,000 per shoe

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string>('');
  const [subaccount, setSubaccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    hostel: '',
    roomNumber: '',
    landmark: ''
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total commission (per shoe, not per order)
  const totalCommission = refCode 
    ? cartItems.reduce((sum, item) => sum + (COMMISSION_PER_SHOE * item.quantity), 0)
    : 0;

  useEffect(() => {
    const urlRef = searchParams.get('ref');
    const savedCart = sessionStorage.getItem('checkoutCart');
    
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
    } else {
      router.push('/');
      return;
    }

    let finalRef = urlRef;
    if (!finalRef && cartItems[0]?.referralCode) {
      finalRef = cartItems[0].referralCode;
    }
    if (!finalRef) {
      finalRef = localStorage.getItem('pendingReferral');
    }

    if (finalRef) {
      setRefCode(finalRef);
      const findReferrer = async () => {
        try {
          const usersQuery = query(collection(db, 'users'), where('referralCode', '==', finalRef));
          const usersSnapshot = await getDocs(usersQuery);
          if (!usersSnapshot.empty) {
            const referrer = usersSnapshot.docs[0];
            setReferrerId(referrer.id);
          }
        } catch (error) {
          console.error('Error finding referrer:', error);
        }
      };
      findReferrer();
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        sessionStorage.setItem('redirectAfterLogin', '/checkout');
        router.push('/auth');
      } else {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          fullName: user.displayName || ''
        }));
        setOrderReference(`EAZY-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Calculate how many shoes were referred (total quantity)
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const commissionEarned = refCode ? COMMISSION_PER_SHOE * totalQuantity : 0;
      
      const orderData = {
        orderReference: reference,
        userId: user.uid,
        userEmail: user.email,
        deliveryAddress: formData,
        products: cartItems.map(item => ({
          ...item,
          commission: COMMISSION_PER_SHOE * item.quantity // Per product commission
        })),
        totalAmount: totalAmount,
        totalQuantity: totalQuantity,
        status: 'paid',
        paymentMethod: 'paystack',
        referralCode: refCode,
        referrerId: referrerId,
        commission: commissionEarned, // Total commission for this order
        commissionPerShoe: COMMISSION_PER_SHOE,
        createdAt: new Date(),
        paidAt: new Date()
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Update referrer's earnings
      if (refCode && referrerId) {
        const referrerRef = doc(db, 'users', referrerId);
        const referrerDoc = await getDoc(referrerRef);
        if (referrerDoc.exists()) {
          const currentEarnings = referrerDoc.data().totalEarnings || 0;
          const currentReferrals = referrerDoc.data().totalReferrals || 0;
          
          await updateDoc(referrerRef, {
            totalEarnings: currentEarnings + commissionEarned,
            totalReferrals: currentReferrals + totalQuantity // Each shoe counts as a referral
          });
        }
      }

      localStorage.removeItem('pendingReferral');
      sessionStorage.removeItem('checkoutCart');
      router.push(`/order-success?ref=${reference}`);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your payment to order</p>
            {refCode && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                <p className="text-green-700 font-semibold">
                  🎉 You're shopping through a referral link!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  The person who referred you will get ₦{COMMISSION_PER_SHOE.toLocaleString()} for every shoe you buy!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Delivery Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Information</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Hostel *"
                    required
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Room Number *"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between py-2">
                  <span>
                    {item.productName} x{item.quantity}
                    {item.size && <span className="text-gray-500 ml-2">Size: {item.size}</span>}
                  </span>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
                {refCode && (
                  <div className="flex justify-between text-sm text-green-600 mt-2">
                    <span>Referral commission:</span>
                    <span>+ ₦{(cartItems.reduce((sum, item) => sum + (COMMISSION_PER_SHOE * item.quantity), 0)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Button */}
            <PaystackButton
              email={user.email}
              amount={totalAmount}
              reference={orderReference}
              onSuccess={handlePaymentSuccess}
              onClose={() => alert('Payment cancelled')}
              metadata={{
                userId: user.uid,
                referralCode: refCode,
                referrerId: referrerId,
                products: cartItems,
                commission: totalCommission
              }}
              subaccount={subaccount}
            />

            <p className="text-xs text-gray-500 text-center">
              Payments processed securely by Paystack.
              You'll receive a confirmation email after payment.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}