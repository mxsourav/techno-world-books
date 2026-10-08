/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { CartItem, Order, Address, User } from '@/types';
import { cartService, wishlistService, profileService } from '@/services/api';



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
  applyCoupon: (code: string) => { ok: boolean; message: string };
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
  const [cart, setCart] = useState<CartItem[]>(() => {
    const raw = loadArray<any>('twb_cart');
    return raw
      .map(i => ({ bookId: String(i.bookId || i.id || '').trim(), qty: Number(i.qty || i.quantity || 1) }))
      .filter(i => i.bookId.length > 0 && i.qty > 0);
  });
  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    const raw = loadArray<any>('twb_saved');
    return raw
      .map(i => ({ bookId: String(i.bookId || i.id || '').trim(), qty: Number(i.qty || i.quantity || 1) }))
      .filter(i => i.bookId.length > 0 && i.qty > 0);
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const raw = loadArray<any>('twb_wishlist');
    return raw
      .map(i => String(typeof i === 'string' ? i : i.id || i.bookId || '').trim())
      .filter(id => id.length > 0);
  });
  const [orders, setOrders] = useState<Order[]>(() => loadArray('twb_orders'));
  const [user, setUser] = useState<User | null>(() => {
    return load<User | null>('twb_user', null);
  });
  const [addresses, setAddresses] = useState<Address[]>(() => loadArray('twb_addresses'));
  const [searchHistory, setSearchHistory] = useState<string[]>(() => loadArray('twb_history'));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const raw = loadArray<any>('twb_recent');
    return raw
      .map(i => String(typeof i === 'string' ? i : i.id || i.bookId || '').trim())
      .filter(id => id.length > 0);
  });
  const [coupon, setCoupon] = useState<string | null>(() => load('twb_coupon', null));

  useEffect(() => { localStorage.setItem('twb_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('twb_saved', JSON.stringify(savedForLater)); }, [savedForLater]);
  useEffect(() => { localStorage.setItem('twb_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('twb_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('twb_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('twb_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('twb_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('twb_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('twb_coupon', JSON.stringify(coupon)); }, [coupon]);

  const initialSyncDoneRef = useRef(false);

  // Sync cart & wishlist with backend PostgreSQL database when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (!token) {
      initialSyncDoneRef.current = false;
      return;
    }

    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;

    // 1. Sync guest cart to DB and merge with any existing account items
    if (cart.length > 0) {
      cartService.syncCart(cart).then((res: any) => {
        const items = res?.items || res?.data?.items;
        if (Array.isArray(items)) {
          setCart(items.map((i: any) => ({ bookId: i.bookId, qty: i.qty })));
        }
      }).catch(() => {});
    } else {
      cartService.getCart().then((res: any) => {
        const items = res?.items || res?.data?.items;
        if (Array.isArray(items) && items.length > 0) {
          setCart(items.map((i: any) => ({ bookId: i.bookId, qty: i.qty })));
        }
      }).catch(() => {});
    }

    // 2. Sync guest wishlist to DB and merge
    if (wishlist.length > 0) {
      wishlistService.syncWishlist(wishlist).then((res: any) => {
        const bookIds = res?.bookIds || res?.data?.bookIds;
        if (Array.isArray(bookIds)) {
          setWishlist(bookIds);
        }
      }).catch(() => {});
    } else {
      wishlistService.getWishlist().then((res: any) => {
        const bookIds = res?.bookIds || res?.data?.bookIds;
        if (Array.isArray(bookIds) && bookIds.length > 0) {
          setWishlist(bookIds);
        }
      }).catch(() => {});
    }

    // 3. Sync live TechnoPoints balance so Header badge & Checkout always match
    profileService.getPoints().then((res: any) => {
      if (res?.success && res?.data && typeof res.data.technoPoints !== 'undefined') {
        const livePts = Number(res.data.technoPoints) || 0;
        setUser((prev) => (prev && prev.rewardPoints !== livePts ? { ...prev, rewardPoints: livePts } : prev));
      }
    }).catch(() => {});
  }, [user]);

  const addToCart = useCallback((bookId: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.bookId === bookId);
      const newQty = ex ? Math.min(ex.qty + qty, 10) : qty;
      const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
      if (token) {
        cartService.updateItem(bookId, newQty).catch(() => {});
      }
      if (ex) return c.map((i) => (i.bookId === bookId ? { ...i, qty: newQty } : i));
      return [...c, { bookId, qty }];
    });
    setSavedForLater((s) => s.filter((i) => i.bookId !== bookId));
  }, []);

  const removeFromCart = useCallback((bookId: string) => {
    setCart((c) => c.filter((i) => i.bookId !== bookId));
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (token) {
      cartService.removeItem(bookId).catch(() => {});
    }
  }, []);

  const setQty = useCallback((bookId: string, qty: number) => {
    if (qty < 1) return;
    const capped = Math.min(qty, 10);
    setCart((c) => c.map((i) => (i.bookId === bookId ? { ...i, qty: capped } : i)));
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (token) {
      cartService.updateItem(bookId, capped).catch(() => {});
    }
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
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (token) {
      wishlistService.toggleItem(bookId).catch(() => {});
    }
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
    if (user) setUser({ ...user, rewardPoints: user.rewardPoints + Math.floor((order.subtotal || order.total || 0) / 100) });
    return order;
  }, [user]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((o) => o.filter((ord) => ord.id !== orderId));
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
  }, []);
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

  const applyCoupon = useCallback((code: string) => {
    setCoupon(code.trim().toUpperCase());
    return { ok: true, message: 'Coupon applied, validating...' };
  }, []);

  const clearCoupon = useCallback(() => { setCoupon(null); }, []);
  const clearCart = useCallback(() => {
    setCart([]);
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (token) {
      cartService.clearCart().catch(() => {});
    }
  }, []);

  const value = useMemo<StoreState>(() => ({
    cart, savedForLater, wishlist, orders, user, addresses, searchHistory, recentlyViewed, coupon,
    addToCart, removeFromCart, setQty, saveForLater, moveToCart, toggleWishlist, isWishlisted,
    placeOrder, cancelOrder, login, logout, addAddress, addSearchToHistory, addRecentlyViewed,
    applyCoupon, clearCoupon, clearCart,
  }), [cart, savedForLater, wishlist, orders, user, addresses, searchHistory, recentlyViewed, coupon,
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

