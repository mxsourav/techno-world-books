/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { CartItem, Order, Address, User } from '@/types';
import { couponService } from '@/services/api';


interface StoreState {
  cart: CartItem[];
  savedForLater: CartItem[];
  wishlist: string[];
  orders: Order[];
  user: User | null;
  addresses: Address[];
  searchHistory: string[];
  recentlyViewed: string[];
  coupon: string | null;
  couponDiscount: number;
  addToCart: (bookId: string, qty?: number) => void;
  removeFromCart: (bookId: string) => void;
  setQty: (bookId: string, qty: number) => void;
  saveForLater: (bookId: string) => void;
  moveToCart: (bookId: string) => void;
  toggleWishlist: (bookId: string) => void;
  isWishlisted: (bookId: string) => boolean;
  placeOrder: (order: Omit<Order, 'id' | 'placedAt' | 'status' | 'trackingId' | 'expectedDelivery' | 'courier'>) => Order;
  cancelOrder: (orderId: string) => void;
  login: (user: User) => void;
  logout: () => void;
  addAddress: (a: Address) => void;
  addSearchToHistory: (q: string) => void;
  addRecentlyViewed: (bookId: string) => void;
  applyCoupon: (code: string, cartTotal: number, cartItems?: { bookId: string; categoryId?: string; quantity: number; price: number }[]) => Promise<{ ok: boolean; message: string }>;
  clearCoupon: () => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    if (!v || v === 'null') return fallback;
    const parsed = JSON.parse(v);
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
};

const loadArray = <T,>(key: string): T[] => {
  try {
    const v = localStorage.getItem(key);
    if (!v || v === 'null') return [];
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Coupons are now validated via the backend API — no hardcoded list needed

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadArray('twb_cart'));
  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => loadArray('twb_saved'));
  const [wishlist, setWishlist] = useState<string[]>(() => loadArray('twb_wishlist'));
  const [orders, setOrders] = useState<Order[]>(() => loadArray('twb_orders'));
  const [user, setUser] = useState<User | null>(() => load('twb_user', null));
  const [addresses, setAddresses] = useState<Address[]>(() => loadArray('twb_addresses'));
  const [searchHistory, setSearchHistory] = useState<string[]>(() => loadArray('twb_history'));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => loadArray('twb_recent'));
  const [coupon, setCoupon] = useState<string | null>(() => load('twb_coupon', null));
  const [couponDiscount, setCouponDiscount] = useState<number>(() => load('twb_coupon_discount', 0));

  useEffect(() => { localStorage.setItem('twb_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('twb_saved', JSON.stringify(savedForLater)); }, [savedForLater]);
  useEffect(() => { localStorage.setItem('twb_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('twb_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('twb_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('twb_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('twb_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('twb_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('twb_coupon', JSON.stringify(coupon)); }, [coupon]);
  useEffect(() => { localStorage.setItem('twb_coupon_discount', JSON.stringify(couponDiscount)); }, [couponDiscount]);

  const addToCart = useCallback((bookId: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.bookId === bookId);
      if (ex) return c.map((i) => (i.bookId === bookId ? { ...i, qty: Math.min(i.qty + qty, 10) } : i));
      return [...c, { bookId, qty }];
    });
    setSavedForLater((s) => s.filter((i) => i.bookId !== bookId));
  }, []);

  const removeFromCart = useCallback((bookId: string) => setCart((c) => c.filter((i) => i.bookId !== bookId)), []);

  const setQty = useCallback((bookId: string, qty: number) => {
    if (qty < 1) return;
    setCart((c) => c.map((i) => (i.bookId === bookId ? { ...i, qty: Math.min(qty, 10) } : i)));
  }, []);

  const saveForLater = useCallback((bookId: string) => {
    setCart((c) => {
      const item = c.find((i) => i.bookId === bookId);
      if (item) setSavedForLater((s) => [...s.filter((i) => i.bookId !== bookId), item]);
      return c.filter((i) => i.bookId !== bookId);
    });
  }, []);

  const moveToCart = useCallback((bookId: string) => {
    setSavedForLater((s) => {
      const item = s.find((i) => i.bookId === bookId);
      if (item) addToCart(bookId, item.qty);
      return s.filter((i) => i.bookId !== bookId);
    });
  }, [addToCart]);

  const toggleWishlist = useCallback((bookId: string) => {
    setWishlist((w) => (w.includes(bookId) ? w.filter((id) => id !== bookId) : [...w, bookId]));
  }, []);

  const isWishlisted = useCallback((bookId: string) => wishlist.includes(bookId), [wishlist]);

  const placeOrder = useCallback((data: Omit<Order, 'id' | 'placedAt' | 'status' | 'trackingId' | 'expectedDelivery' | 'courier'>): Order => {
    const couriers = ['Delhivery', 'Blue Dart', 'Xpressbees', 'DTDC', 'Ecom Express', 'India Post'];
    const order: Order = {
      ...data,
      id: 'TWB' + Date.now().toString().slice(-8),
      placedAt: new Date().toISOString(),
      status: 'Placed',
      trackingId: 'TRK' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      expectedDelivery: new Date(Date.now() + 4 * 86400000).toISOString(),
      courier: couriers[Math.floor(Math.random() * couriers.length)],
    };
    setOrders((o) => [order, ...o]);
    setCart([]);
    setCoupon(null);
    if (user) setUser({ ...user, rewardPoints: user.rewardPoints + Math.floor(order.total / 100) * 5 });
    return order;
  }, [user]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((o) => o.filter((ord) => ord.id !== orderId));
  }, []);

  const login = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const addAddress = useCallback((a: Address) => setAddresses((arr) => [...arr, a]), []);

  const addSearchToHistory = useCallback((q: string) => {
    const t = q.trim();
    if (!t) return;
    setSearchHistory((h) => [t, ...h.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8));
  }, []);

  const addRecentlyViewed = useCallback((bookId: string) => {
    setRecentlyViewed((r) => [bookId, ...r.filter((id) => id !== bookId)].slice(0, 10));
  }, []);

  const applyCoupon = useCallback(async (code: string, cartTotal: number, cartItems?: { bookId: string; categoryId?: string; quantity: number; price: number }[]) => {
    const c = code.trim().toUpperCase();
    try {
      const res = await couponService.validate({ code: c, cartTotal, userId: user?.id, cartItems });
      const data = res.data;
      if (data?.valid) {
        setCoupon(c);
        setCouponDiscount(data.discount || 0);
        return { ok: true, message: data.message || `${c} applied!` };
      }
      return { ok: false, message: data?.message || 'Invalid coupon code' };
    } catch (err: any) {
      return { ok: false, message: err?.response?.data?.message || err?.message || 'Failed to validate coupon' };
    }
  }, [user]);

  const clearCoupon = useCallback(() => { setCoupon(null); setCouponDiscount(0); }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<StoreState>(() => ({
    cart, savedForLater, wishlist, orders, user, addresses, searchHistory, recentlyViewed, coupon, couponDiscount,
    addToCart, removeFromCart, setQty, saveForLater, moveToCart, toggleWishlist, isWishlisted,
    placeOrder, cancelOrder, login, logout, addAddress, addSearchToHistory, addRecentlyViewed,
    applyCoupon, clearCoupon, clearCart,
  }), [cart, savedForLater, wishlist, orders, user, addresses, searchHistory, recentlyViewed, coupon, couponDiscount,
    addToCart, removeFromCart, setQty, saveForLater, moveToCart, toggleWishlist, isWishlisted,
    placeOrder, cancelOrder, login, logout, addAddress, addSearchToHistory, addRecentlyViewed,
    applyCoupon, clearCoupon, clearCart]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

