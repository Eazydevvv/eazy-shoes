// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: number;
  color?: string;
  image?: string;
  referralCode?: string | null;
  addedAt?: number; // ADD THIS
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size?: number, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: number, color?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        i => i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      
      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += item.quantity;
        if (item.referralCode) {
          updatedCart[existingIndex].referralCode = item.referralCode;
        }
        if (item.addedAt) {
          updatedCart[existingIndex].addedAt = item.addedAt;
        }
        return updatedCart;
      } else {
        return [...prevCart, item];
      }
    });
  };

  const removeFromCart = (productId: string, size?: number, color?: string) => {
    setCart(prevCart => prevCart.filter(
      i => !(i.productId === productId && i.size === size && i.color === color)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, size?: number, color?: string) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.productId === productId && item.size === size && item.color === color) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}