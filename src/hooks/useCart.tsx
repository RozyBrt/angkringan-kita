'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Cart, MenuItem } from '@/types';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
  getCartItemCount,
} from '@/lib/cart';

interface CartContextValue {
  cart: Cart;
  itemCount: number;
  total: number;
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateItemQuantity: (menuItemId: string, quantity: number) => void;
  emptyCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });

  useEffect(() => {
    // Initial load
    setCart(getCart());

    // Listen for changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'angkringan_cart') {
        setCart(getCart());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    setCart(addToCart(item));
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setCart(removeFromCart(menuItemId));
  }, []);

  const updateItemQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart(updateQuantity(menuItemId, quantity));
  }, []);

  const emptyCart = useCallback(() => {
    setCart(clearCart());
  }, []);

  const itemCount = getCartItemCount(cart);
  const total = getCartTotal(cart);

  return (
    <CartContext.Provider value={{ cart, itemCount, total, addItem, removeItem, updateItemQuantity, emptyCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
