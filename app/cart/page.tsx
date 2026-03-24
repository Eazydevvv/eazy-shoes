'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        // Save cart to session for checkout
        sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
        router.push('/checkout');
    };

    if (cart.length === 0) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-6xl mb-6">🛒</div>
                        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            href="/products"
                            className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition inline-block"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-black mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="bg-white rounded-2xl shadow-lg p-4 flex gap-4">
                                {/* Image */}
                                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
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
                                {/* Details */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{item.productName}</h3>
                                    {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                                    {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                                    <p className="text-xl font-bold mt-2">₦{item.price}</p>
                                </div>

                                {/* Quantity */}
                                <div className="flex flex-col items-end space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black"
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

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₦{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Delivery</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₦{getCartTotal()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={clearCart}
                                className="w-full mt-3 text-gray-500 text-sm hover:text-red-500 transition"
                            >
                                Clear Cart
                            </button>

                            <Link
                                href="/products"
                                className="block text-center mt-4 text-gray-500 hover:text-black transition"
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