'use client';

import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <Link href="/products" className="bg-black text-white px-6 py-3 rounded-full">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl shadow p-4">
              <Link href={`/product/${item.productId}`}>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} width={150} height={150} />
                  ) : (
                    <span className="text-4xl">👟</span>
                  )}
                </div>
                <h3 className="font-semibold">{item.productName}</h3>
                <p className="text-green-600 font-bold">₦{item.price.toLocaleString()}</p>
              </Link>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="mt-2 text-red-500 text-sm w-full border border-red-300 py-1 rounded hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}