'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Suspense } from 'react';
import { FaWhatsapp, FaTwitter, FaFacebookF } from 'react-icons/fa';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    brand?: string;
    gender?: string;
    images: string[];
    sizes: number[];
    colors: string[];
    inStock: boolean;
    rating: number;
    reviews: number;
}

function ProductContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToCart } = useCart();

    const [refCode, setRefCode] = useState<string | null>(null);
    const [shareReferralCode, setShareReferralCode] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [user, setUser] = useState<any>(null);
    const [addingToCart, setAddingToCart] = useState(false);

    // Build share link with referral code
    const getShareLink = () => {
        if (typeof window === 'undefined') return '';
        const baseUrl = window.location.href.split('?')[0];
        const code = refCode || shareReferralCode;
        if (code) {
            return `${baseUrl}?ref=${code}`;
        }
        return baseUrl;
    };

    const shareLink = getShareLink();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setRefCode(ref);
            setShareReferralCode(ref);
            if (typeof window !== 'undefined') {
                localStorage.setItem('referralCode', ref);
                localStorage.setItem('pendingReferral', ref);
                localStorage.setItem('pendingProduct', params.id as string);
            }
            console.log('🎯 Product referral detected:', ref);
        } else {
            const savedRef = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;
            if (savedRef) {
                setShareReferralCode(savedRef);
            }
        }

        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'products', params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, [params.id, searchParams]);

    const handleBuyNow = () => {
        if (!product) return;

        if (product.sizes?.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }

        if (product.colors?.length > 0 && !selectedColor) {
            alert('Please select a color');
            return;
        }

        const cartItem = {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor,
            image: product.images?.[0] || '',
            referralCode: refCode
        };

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('checkoutCart', JSON.stringify([cartItem]));
        }

        const checkoutUrl = refCode ? `/checkout?ref=${refCode}` : '/checkout';
        router.push(checkoutUrl);
    };

    const handleAddToCart = () => {
        if (!product) return;

        if (product.sizes?.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }

        if (product.colors?.length > 0 && !selectedColor) {
            alert('Please select a color');
            return;
        }

        addToCart({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: quantity,
            size: selectedSize !== null ? selectedSize : undefined,
            color: selectedColor !== null ? selectedColor : undefined,
            image: product.images?.[0] || ''
        });

        alert('Added to cart!');
    };

    if (loading) {
        return (
            <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-96 rounded-3xl mb-8" style={{ backgroundColor: 'var(--card)' }}></div>
                            <div className="h-12 rounded w-3/4 mb-4" style={{ backgroundColor: 'var(--card)' }}></div>
                            <div className="h-6 rounded w-1/2 mb-8" style={{ backgroundColor: 'var(--card)' }}></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-16 rounded" style={{ backgroundColor: 'var(--card)' }}></div>
                                <div className="h-16 rounded" style={{ backgroundColor: 'var(--card)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--foreground)' }}>Product Not Found</h1>
                    <p className="mb-8 opacity-70">The product you're looking for doesn't exist.</p>
                    <Link href="/" className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-semibold hover:opacity-80 transition">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--background)' }}>
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Referral Banner */}
                    {refCode && (
                        <div className="mb-6 rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                            <p style={{ color: 'var(--foreground)' }}>
                                🎉 You came through a referral link! When you buy this shoe, the person who referred you gets ₦2,000 per shoe!
                            </p>
                        </div>
                    )}

                    {/* Breadcrumb */}
                    <div className="flex items-center space-x-2 text-sm mb-8">
                        <Link href="/" className="opacity-70 hover:opacity-100 transition" style={{ color: 'var(--foreground)' }}>Home</Link>
                        <span className="opacity-50">/</span>
                        <Link href="/products" className="opacity-70 hover:opacity-100 transition" style={{ color: 'var(--foreground)' }}>{product.category}</Link>
                        <span className="opacity-50">/</span>
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{product.name}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-3xl overflow-hidden group" style={{ backgroundColor: 'var(--card)' }}>
                                {product.images && product.images[activeImage] ? (
                                    <Image
                                        src={product.images[activeImage]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-8xl mb-4 block">👟</span>
                                            <p className="opacity-50">{product.name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Hover to zoom
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                                                activeImage === index ? 'ring-2 ring-black dark:ring-white scale-105' : 'hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: 'var(--card)' }}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-8">
                            {/* Header */}
                            <div>
                                <h1 className="text-5xl font-black mb-3" style={{ color: 'var(--foreground)' }}>{product.name}</h1>
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>₦{product.price.toLocaleString()}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        product.inStock 
                                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                    }`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                {product.brand && (
                                    <p className="opacity-70 mt-2">Brand: {product.brand}</p>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="opacity-70">{product.rating} · {product.reviews} reviews</span>
                            </div>

                            {/* Description */}
                            <p className="leading-relaxed text-lg opacity-80">
                                {product.description}
                            </p>

                            {/* Colors */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-4 text-lg" style={{ color: 'var(--foreground)' }}>Color</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                                                    selectedColor === color
                                                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white opacity-80'
                                                }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-4 text-lg" style={{ color: 'var(--foreground)' }}>Size</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-16 h-16 rounded-xl border-2 transition-all duration-300 ${
                                                    selectedSize === size
                                                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white opacity-80'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <h3 className="font-semibold mb-4 text-lg" style={{ color: 'var(--foreground)' }}>Quantity</h3>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-14 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-black dark:hover:border-white transition-all text-xl font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-16 text-center" style={{ color: 'var(--foreground)' }}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-14 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-black dark:hover:border-white transition-all text-xl font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || !product.inStock}
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black py-5 rounded-xl font-bold text-lg hover:opacity-80 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                                </button>
                                
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!product.inStock}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Buy Now</span>
                                </button>
                            </div>

                            {/* Social Share Buttons */}
                            <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-sm opacity-70 mb-3">Share this shoe:</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            window.open(
                                                `https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} on EAZY! ${shareLink}`)}`,
                                                '_blank'
                                            )
                                        }
                                        className="p-2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 hover:scale-110 transition"
                                    >
                                        <FaWhatsapp size={18} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            window.open(
                                                `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} on EAZY!`)}&url=${encodeURIComponent(shareLink)}`,
                                                '_blank'
                                            )
                                        }
                                        className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full w-10 h-10 flex items-center justify-center hover:opacity-80 hover:scale-110 transition"
                                    >
                                        <FaTwitter size={18} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            window.open(
                                                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
                                                '_blank'
                                            )
                                        }
                                        className="p-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition"
                                    >
                                        <FaFacebookF size={18} />
                                    </button>
                                </div>
                                {shareReferralCode && (
                                    <p className="text-xs opacity-50 mt-2">
                                        Your referral code: <span className="font-mono">{shareReferralCode}</span>
                                    </p>
                                )}
                            </div>

                            {/* Login/Register Prompt */}
                            {!user && (
                                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                                        Already have an account?{' '}
                                        <Link href="/auth" className="font-semibold underline opacity-80 hover:opacity-100">
                                            Sign in
                                        </Link>{' '}
                                        for faster checkout.
                                    </p>
                                </div>
                            )}

                            {/* Delivery Info */}
                            <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--card)' }}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>Free Campus Delivery</p>
                                        <p className="text-sm opacity-70">Delivered to your hostel within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ProductPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
            </div>
        }>
            <ProductContent />
        </Suspense>
    );
}