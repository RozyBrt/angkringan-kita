import { Cart, CartItem, MenuItem } from '@/types';

const CART_STORAGE_KEY = 'angkringan_cart';

export function getCart(): Cart {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(menuItem: MenuItem): Cart {
  const cart = getCart();
  const existingIndex = cart.items.findIndex(
    (item) => item.menuItem.id === menuItem.id
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += 1;
  } else {
    const newItem: CartItem = { menuItem, quantity: 1 };
    cart.items.push(newItem);
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(menuItemId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.menuItem.id !== menuItemId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(menuItemId: string, quantity: number): Cart {
  const cart = getCart();
  if (quantity <= 0) {
    return removeFromCart(menuItemId);
  }
  const item = cart.items.find((i) => i.menuItem.id === menuItemId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
  }
  return cart;
}

export function clearCart(): Cart {
  const emptyCart: Cart = { items: [] };
  saveCart(emptyCart);
  return emptyCart;
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce(
    (total, item) => total + item.menuItem.price * item.quantity,
    0
  );
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}
