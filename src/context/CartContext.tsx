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
  toggleItemSelected: (itemId: string) => void;
  clearCartSelection: () => void;
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
      // Make ID more specific by including packaging
      const customId = JSON.stringify({
        color: customization.color,
        printSides: customization.printSides,
        side1: customization.side1,
        side2: customization.side2,
        packaging: customization.packaging,
      });
      const itemId = `${product.id}-${customId}`;

      const existingItem = prevCart.find((item) => item.id === itemId);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity, selected: true } : item
        );
      } else {
        const newItem: CartItem = {
          id: itemId,
          product,
          customization,
          quantity,
          price,
          selected: true,
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
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    });
  };

  const toggleItemSelected = (itemId: string) => {
    setCart(prevCart => prevCart.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  }
  
  const clearCartSelection = () => {
    setCart(prevCart => prevCart.map(item => ({...item, selected: false})));
  }
  
  const clearCart = () => {
    // This now clears only the selected items after a successful checkout
    setCart(prevCart => prevCart.filter(item => !item.selected));
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, toggleItemSelected, clearCartSelection }}>
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
