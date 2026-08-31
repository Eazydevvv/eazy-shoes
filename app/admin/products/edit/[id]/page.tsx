'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DragDropImageUpload from '@/components/ui/DragDropImageUpload';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const productTypes = ['Sneakers', 'Cooperate', 'Slides', 'Palm'];
  const brands = ['Nike', 'Balenciaga', 'Dr. Martens', 'Chunky', 'Adidas', 'Ogiy', 'Balance', 'Zara', 'Louis Vuitton', 'Vans', 'Air', 'Puma', 'Givenchy', 'Prada', 'Naked Wolfe', 'Air Jordan'];
  const genders = ['Unisex'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            price: data.price?.toString() || '',
            description: data.description || '',
            category: data.category || '',
            brand: data.brand || '',
            gender: data.gender || 'Unisex',
            sizes: data.sizes?.join(', ') || '',
            colors: data.colors?.join(', ') || '',
            inStock: data.inStock ?? true,
            featured: data.featured ?? false,
            flashSale: data.flashSale ?? false,
            rating: data.rating || 4.5,
            reviews: data.reviews || 0
          });
          setImageUrls(data.images || []);
        } else {
          alert('Product not found');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'products', productId), productData);
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          <DragDropImageUpload
            onImagesUploaded={(urls) => setImageUrls(urls)}
            existingImages={imageUrls}
            maxFiles={5}
          />
          <p className="text-xs text-gray-400 mt-2">
            Upload multiple images. First image is the main product image.
          </p>
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
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-gray-700">In Stock</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-gray-700">Featured Product</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.flashSale}
              onChange={(e) => setFormData({...formData, flashSale: e.target.checked})}
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-gray-700">🔥 Flash Sale</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:border-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}