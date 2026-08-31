'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import DragDropImageUpload from '@/components/ui/DragDropImageUpload';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
    gender: 'Unisex',
    sizes: '',
    colors: '',
    inStock: true,
    featured: false,
    flashSale: false,
    rating: 4.5,
    reviews: 0
  });

  // Hardcoded categories
  const productTypes = ['Sneakers', 'Cooperate', 'Slides', 'Palm'];
  const brands = ['Nike', 'Balenciaga', 'Dr. Martens', 'Chunky', 'Adidas', 'Ogiy', 'Balance', 'Zara', 'Louis Vuitton', 'Vans', 'Air', 'Puma', 'Givenchy', 'Prada', 'Naked Wolfe', 'Air Jordan'];
  const genders = ['Unisex'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sizesArray = formData.sizes 
        ? formData.sizes.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s))
        : [];
      const colorsArray = formData.colors 
        ? formData.colors.split(',').map(c => c.trim()).filter(c => c)
        : [];

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        gender: formData.gender,
        sizes: sizesArray,
        colors: colorsArray,
        inStock: formData.inStock,
        featured: formData.featured,
        flashSale: formData.flashSale,
        rating: formData.rating,
        reviews: formData.reviews,
        images: imageUrls,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'products'), productData);
      router.push('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Image Upload - Drag & Drop Multiple */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Images (Drag & Drop Multiple)
          </label>
          <DragDropImageUpload
            onImagesUploaded={(urls) => setImageUrls(urls)}
            existingImages={imageUrls}
            maxFiles={5}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Upload multiple images. First image will be the main product image.
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Nike Air Max 270"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₦) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="50000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Product description..."
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Type *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select type</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand *</label>
            <select
              required
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {genders.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sizes (comma-separated)</label>
            <input
              type="text"
              value={formData.sizes}
              onChange={(e) => setFormData({...formData, sizes: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="38, 39, 40, 41, 42, 43"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors (comma-separated)</label>
          <input
            type="text"
            value={formData.colors}
            onChange={(e) => setFormData({...formData, colors: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Black/White, Red/Black, Blue/White"
          />
        </div>

        {/* Status Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black dark:focus:ring-white"
            />
            <span className="text-gray-700 dark:text-gray-300">In Stock</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black dark:focus:ring-white"
            />
            <span className="text-gray-700 dark:text-gray-300">Featured Product</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.flashSale}
              onChange={(e) => setFormData({...formData, flashSale: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-black focus:ring-black dark:focus:ring-white"
            />
            <span className="text-gray-700 dark:text-gray-300">🔥 Flash Sale</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:border-gray-400 dark:hover:border-gray-500 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}