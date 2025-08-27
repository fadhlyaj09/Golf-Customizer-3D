'use client';

import type { CartItem, Product, Customization } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, customization: Customization, quantity: number, price: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('golf-cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      setCart([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('golf-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, customization: Customization, quantity: number, price: number) => {
    setCart((prevCart) => {
      // Create a unique ID for the cart item based on product and customizations
      const customId = JSON.stringify(customization);
      const itemId = `${product.id}-${customId}`;

      const existingItem = prevCart.find((item) => item.id === itemId);

      if (existingItem) {
        // Update quantity of existing item
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: itemId,
          product,
          customization,
          quantity,
          price,
        };
        return [...prevCart, newItem];
      }
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast({
      title: 'Item Removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
