'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  featured?: boolean;
}


export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
        setFeaturedProducts(productsData.filter(p => p.featured));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Image */}
      <section className="relative bg-black text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Sneaker collection"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center md:text-left md:mx-0">
            {/* Logo */}
            <div className="flex justify-center md:justify-start mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-lg border border-white/20 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-5xl">👟</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
                Step Into EAZY
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl">
              Premium sneakers delivered to your campus. 
              <span className="block mt-2 font-semibold text-yellow-400">Refer friends and earn rewards.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={scrollToProducts}
                className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center"
              >
                Shop Collection
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Start Earning
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                Featured Drops
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The most anticipated releases, hand-picked for your campus style
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories with Images */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Running', icon: '🏃', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
              { name: 'Lifestyle', icon: '✨', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=400&fit=crop' },
              { name: 'Basketball', icon: '🏀', image: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=400&h=400&fit=crop' },
              { name: 'Skateboarding', icon: '🛹', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop' }
            ].map((category, i) => (
              <button 
                key={category.name}
                onClick={() => router.push(`/?category=${category.name.toLowerCase()}`)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-square">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <span className="text-4xl mb-2 block opacity-80 group-hover:opacity-100 transition-opacity">
                      {category.icon}
                    </span>
                    <h3 className="text-white text-xl font-bold">{category.name}</h3>
                    <p className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                      Shop Now →
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="py-24 bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Earn While You{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Wear
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Refer a friend and get $20 off your next purchase. They get $10 off too!
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-12 py-4 rounded-full font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105"
            >
              Start Referring
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}