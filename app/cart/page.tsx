'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    // Get referral from cart items
    const referralItem = cart.find(item => item.referralCode);
    const referralCode = referralItem?.referralCode || null;
    
    // Save cart with referral
    sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
    
    const checkoutUrl = referralCode ? `/checkout?ref=${referralCode}` : '/checkout';
    router.push(checkoutUrl);
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen py-20" style={{ backgroundColor: 'var(--background)' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="mb-8 opacity-70">Looks like you haven't added anything to your cart yet.</p>
            <Link
              href="/products"
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-black mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="rounded-2xl shadow-lg p-4 flex gap-4" style={{ backgroundColor: 'var(--card)' }}>
                <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--card-hover)' }}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-3xl">👟</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.productName}</h3>
                  {item.size && <p className="text-sm opacity-70">Size: {item.size}</p>}
                  {item.color && <p className="text-sm opacity-70">Color: {item.color}</p>}
                  <p className="text-xl font-bold mt-2">₦{item.price.toLocaleString()}</p>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-black dark:hover:border-white"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-black dark:hover:border-white"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg p-6 sticky top-24" style={{ backgroundColor: 'var(--card)' }}>
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3 mt-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-3 opacity-60 text-sm hover:opacity-100 transition"
              >
                Clear Cart
              </button>

              <Link
                href="/products"
                className="block text-center mt-4 opacity-60 hover:opacity-100 transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}