'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';

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

const COMMISSION_PER_SHOE = 2000;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    hostel: '',
    roomNumber: '',
    landmark: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCommission = refCode 
    ? cartItems.reduce((sum, item) => sum + (COMMISSION_PER_SHOE * item.quantity), 0)
    : 0;

  const accountDetails = {
    bank: 'PalmPay',
    accountName: 'Israel Olalere',
    accountNumber: '8073042250'
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Upload screenshot to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'eazy-shoes');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Upload failed');
    }
    return data.secure_url;
  };

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
      finalRef = cartItems[0]?.referralCode;
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

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.hostel || !formData.roomNumber) {
      alert('Please fill all delivery fields');
      return;
    }

    if (!screenshot) {
      alert('Please upload a screenshot of your payment');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload screenshot to Cloudinary
      setUploadProgress(30);
      const screenshotUrl = await uploadToCloudinary(screenshot);
      setUploadProgress(60);
      
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const commissionEarned = refCode ? COMMISSION_PER_SHOE * totalQuantity : 0;
      
      const orderData = {
        orderReference: orderReference,
        userId: user.uid,
        userEmail: user.email,
        deliveryAddress: formData,
        products: cartItems.map(item => ({
          ...item,
          commission: COMMISSION_PER_SHOE * item.quantity
        })),
        totalAmount: totalAmount,
        totalQuantity: totalQuantity,
        status: 'pending',
        paymentMethod: 'palmpay',
        referralCode: refCode,
        referrerId: referrerId,
        commission: commissionEarned,
        commissionPerShoe: COMMISSION_PER_SHOE,
        paymentScreenshot: screenshotUrl,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'orders'), orderData);
      setUploadProgress(100);

      if (refCode && referrerId) {
        const referrerRef = doc(db, 'users', referrerId);
        const referrerDoc = await getDoc(referrerRef);
        if (referrerDoc.exists()) {
          const currentReferrals = referrerDoc.data().totalReferrals || 0;
          await updateDoc(referrerRef, {
            totalReferrals: currentReferrals + totalQuantity
          });
        }
      }

      localStorage.removeItem('pendingReferral');
      sessionStorage.removeItem('checkoutCart');
      router.push(`/order-success?ref=${orderReference}`);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setScreenshot(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setScreenshotPreview(previewUrl);
    } else {
      setScreenshotPreview(null);
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
            <p className="text-gray-600">Complete your order</p>
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
                    <span>+ ₦{totalCommission.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Payment Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">💰 Payment Instructions</h2>
              
              <div className="bg-white p-4 rounded-xl mb-4">
                <p className="text-sm text-gray-600 mb-2">Send payment to this account:</p>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
                  <div>
                    <p className="font-bold text-lg">{accountDetails.accountNumber}</p>
                    <p className="text-sm">{accountDetails.bank} - {accountDetails.accountName}</p>
                  </div>
                  <button
                    onClick={copyAccountNumber}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                  >
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <div className="border-t mt-3 pt-3">
                  <p className="text-sm"><strong>Amount to send:</strong> ₦{totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Send exactly this amount for faster confirmation</p>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Payment Screenshot *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                {screenshotPreview && (
                  <div className="mt-2">
                    <img src={screenshotPreview} alt="Payment proof" className="h-32 w-auto rounded-lg border" />
                    <p className="text-xs text-green-600 mt-1">✅ Screenshot ready</p>
                  </div>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                After payment, upload screenshot. Your order will be confirmed after verification.
              </p>
            </div>
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