'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'gender' | 'brand' | 'type' | 'occasion';
  icon?: string;
  order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'type',
    icon: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    
    setSaving(true);
    try {
      const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-');
      await addDoc(collection(db, 'categories'), {
        name: newCategory.name,
        slug: slug,
        type: newCategory.type,
        icon: newCategory.icon || '👟',
        order: categories.length + 1
      });
      setNewCategory({ name: '', type: 'type', icon: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      {/* Add Category Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Category name (e.g., Crocs, Balenciaga)"
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
            required
          />
          <select
            value={newCategory.type}
            onChange={(e) => setNewCategory({...newCategory, type: e.target.value as any})}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none"
          >
            <option value="type">Product Type</option>
            <option value="brand">Brand</option>
            <option value="gender">Gender</option>
            <option value="occasion">Occasion</option>
          </select>
          <input
            type="text"
            placeholder="Icon (emoji)"
            value={newCategory.icon}
            onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
            className="w-20 px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none text-center"
            maxLength={2}
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800"
          >
            {saving ? 'Adding...' : 'Add'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          Add categories like: Nike, Adidas, Crocs, Balenciaga, Men, Women, School, Party, etc.
        </p>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon || '👟'}</span>
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Categories you add here will appear in:</p>
        <p className="mt-1">✅ Product form dropdowns • ✅ Filter buttons • ✅ Navigation menu</p>
      </div>
    </div>
  );
}