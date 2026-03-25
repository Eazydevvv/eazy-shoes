'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import CloudinaryUpload from '@/components/ui/CloudinaryUpload';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
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
  const brands = ['Nike', 'Balenciaga', 'Dr. Martens', 'Chunky', 'Adidas', 'Ogiy', 'Balance', 'Zara'];
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
        images: imageUrl ? [imageUrl] : [],
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
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <CloudinaryUpload onUpload={(url) => setImageUrl(url)} existingImage={imageUrl} />
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
              placeholder="Nike Air Max 270"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
              placeholder="50000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
            placeholder="Product description..."
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Type *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
            >
              <option value="">Select type</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
            <select
              required
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
            >
              {genders.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated)</label>
            <input
              type="text"
              value={formData.sizes}
              onChange={(e) => setFormData({...formData, sizes: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
              placeholder="38, 39, 40, 41, 42, 43"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma-separated)</label>
          <input
            type="text"
            value={formData.colors}
            onChange={(e) => setFormData({...formData, colors: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
            placeholder="Black/White, Red/Black, Blue/White"
          />
        </div>

        {/* Status Toggles */}
        <div className="flex items-center space-x-8">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-black"
            />
            <span>In Stock</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-black"
            />
            <span>Featured Product</span>
          </label>
        </div>

  {/* ADD THIS NEW CHECKBOX */}
  <label className="flex items-center space-x-3">
    <input
      type="checkbox"
      checked={formData.flashSale}
      onChange={(e) => setFormData({...formData, flashSale: e.target.checked})}
      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
    />
    <span className="text-gray-700">🔥 Flash Sale</span>
  </label>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800">
            {loading ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}