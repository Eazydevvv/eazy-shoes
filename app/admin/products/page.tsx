// app/admin/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  featured?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/add"
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-600">Product</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-600">Category</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-600">Price</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-600">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-600">Featured</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="py-4 px-6 font-medium">{product.name}</td>
                <td className="py-4 px-6 text-gray-600">{product.category}</td>
                <td className="py-4 px-6 font-semibold">₦{product.price}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {product.featured ? (
                    <span className="text-yellow-500">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50"
                    >
                      {deleting === product.id ? '⏳' : '🗑️'}
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      target="_blank"
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      👁️
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No products yet</p>
            <Link
              href="/admin/products/add"
              className="text-black hover:underline font-semibold"
            >
              Add your first product →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}