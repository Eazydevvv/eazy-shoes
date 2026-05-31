'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '@/components/ui/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  inStock?: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
        
        const uniqueCategories = ['all', ...new Set(productsData.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        if (categoryFilter && categoryFilter !== 'all') {
          setSelectedCategory(categoryFilter);
          setFilteredProducts(productsData.filter(p => p.category?.toLowerCase() === categoryFilter?.toLowerCase()));
        } else {
          setFilteredProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4" style={{ color: 'var(--foreground)' }}>All Products</h1>
          <p className="max-w-2xl mx-auto opacity-70">
            Discover our complete collection of premium sneakers
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                  : 'border hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              style={{
                backgroundColor: selectedCategory === category ? 'var(--primary)' : 'var(--card)',
                color: selectedCategory === category ? 'var(--background)' : 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="opacity-70 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}