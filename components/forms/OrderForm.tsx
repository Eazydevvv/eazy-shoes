// components/forms/OrderForm.tsx
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface OrderFormProps {
  userId: string;
  userEmail: string;
  userName: string;
  products: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    size?: number;
    color?: string;
  }[];
  totalAmount: number;
  referralCode?: string;
}

export default function OrderForm({ 
  userId, 
  userEmail, 
  userName,
  products, 
  totalAmount,
  referralCode 
}: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userName || '',
    phone: '',
    hostel: '',
    roomNumber: '',
    landmark: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        userId,
        userEmail,
        userName: formData.fullName,
        products: products.map(p => ({
          ...p,
          image: '' // Will add later
        })),
        totalAmount,
        status: 'pending',
        paymentMethod: 'cod',
        referralCode: referralCode || null,
        deliveryAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          hostel: formData.hostel,
          roomNumber: formData.roomNumber,
          landmark: formData.landmark
        },
        createdAt: new Date()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Redirect to success page
      router.push('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostel/Residence *
              </label>
              <input
                type="text"
                required
                value={formData.hostel}
                onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                placeholder="Pentagon Hostel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                placeholder="Room 12B"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({...formData, landmark: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition"
              placeholder="Near the basketball court"
            />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        
        <div className="space-y-3 mb-4">
          {products.map((product, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{product.productName}</span>
                {product.size && <span className="text-gray-500 ml-2">Size: {product.size}</span>}
                {product.color && <span className="text-gray-500 ml-2">Color: {product.color}</span>}
                <span className="text-gray-500 ml-2">x{product.quantity}</span>
              </div>
              <span className="font-medium">${product.price * product.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${totalAmount}</span>
          </div>
          <p className="text-sm text-green-600 mt-2">✓ Pay on Delivery (Cash/Campus Card)</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <span className="animate-spin mr-2">⏳</span>
            Processing Order...
          </div>
        ) : (
          'Place Order (Pay on Delivery)'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By placing this order, you agree to our terms and conditions.
        You'll pay when your order is delivered to your hostel.
      </p>
    </form>
  );
}