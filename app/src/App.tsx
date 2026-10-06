import { useEffect, Suspense, lazy } from 'react';
import { Route, Routes, useLocation, Outlet, Navigate } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { ToastSwipeHandler } from '@/components/common/ToastSwipeHandler';
import { StoreProvider } from '@/store/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Listing from '@/pages/Listing';

// Lazy-loaded pages for optimal bundle size and instantaneous initial load
const Product = lazy(() => import('@/pages/Product'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Profile = lazy(() => import('@/pages/Profile'));
const Track = lazy(() => import('@/pages/Track'));
const BlogList = lazy(() => import('@/pages/Blog').then((m) => ({ default: m.BlogList })));
const BlogPost = lazy(() => import('@/pages/Blog').then((m) => ({ default: m.BlogPost })));
const Help = lazy(() => import('@/pages/Help'));
const About = lazy(() => import('@/pages/About'));
const Terms = lazy(() => import('@/pages/Terms'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('@/pages/ShippingPolicy'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Contact = lazy(() => import('@/pages/Contact'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const MyOrders = lazy(() => import('@/pages/MyOrders'));

import { AuthProvider } from '@/store/AuthStore';
import { CmsProvider } from '@/context/CmsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import HomePopupAd from './components/HomePopupAd';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      '/': 'Techno World Books — Buy Books Online in India | School, College, Exam & Fiction',
      '/cart': 'Shopping Cart | Techno World Books',
      '/checkout': 'Secure Checkout | Techno World Books',
      '/wishlist': 'My Wishlist | Techno World Books',
      '/account': 'My Account | Techno World Books',
      '/track': 'Track Order | Techno World Books',
      '/blog': 'Book Lists & Study Guides | Techno World Books Blog',
      '/about': 'About Us | Techno World Books',
      '/help': 'Help Center | Techno World Books',
      '/terms': 'Terms & Conditions | Techno World Books',
      '/terms-of-service': 'Terms & Conditions | Techno World Books',
      '/refund-policy': 'Cancellation & Replacement Policy | Techno World Books',
      '/shipping-policy': 'Shipping Policy | Techno World Books',
      '/privacy-policy': 'Privacy Policy | Techno World Books',
      '/contact': 'Contact Us | Techno World Books',
    };
    if (titles[pathname]) document.title = titles[pathname];
  }, [pathname]);
  return null;
}

// Funciton to keep the server alive by pinging the backend every 14 minutes to prevent Render free-tier sleep
function KeepAlivePing() {
  useEffect(() => {
    // Ping backend every 14 minutes to prevent Render free-tier sleep
    const interval = setInterval(() => {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || (import.meta.env.PROD ? 'https://api.technoworldbooks.in' : 'http://localhost:5000');
      fetch(`${baseUrl}/health`).catch(() => {});
    }, 14 * 60 * 1000); // 14 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}

// Real-time visitor pulse tracker for live analytics
function VisitorPulseTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Persistent Unique Device ID (Stored in localStorage and 1-year first-party cookie)
    // Ensures multiple visits or tab reopens from the same device NEVER count as a new customer visit
    let deviceId = '';
    try {
      deviceId = localStorage.getItem('tw_device_id') || '';
      if (!deviceId) {
        const match = document.cookie.match(/(?:^|; )tw_did=([^;]*)/);
        deviceId = match ? decodeURIComponent(match[1]) : '';
      }
      if (!deviceId) {
        deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('tw_device_id', deviceId);
      }
      // Sync 1-year cookie for Safari / partitioned storage safety
      document.cookie = `tw_did=${encodeURIComponent(deviceId)};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      deviceId = `dev_fallback_${Math.random().toString(36).substring(2, 10)}`;
    }

    // 2. Tab Session ID (sessionStorage for current active browser tab)
    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('tw_vis_sid') || '';
      if (!sessionId) {
        sessionId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem('tw_vis_sid', sessionId);
      }
    } catch {
      sessionId = `vis_${Date.now()}`;
    }

    const sendPulse = (isPageview: boolean) => {
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? 'https://api.technoworldbooks.in/api/v1' : 'http://localhost:5000/api/v1');

      const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent);
      const isTablet = !isMobile && (window.innerWidth < 1024 || /iPad|Tablet/i.test(navigator.userAgent));
      const detectedDevice = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

      fetch(`${baseUrl}/analytics/pulse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          sessionId,
          path: pathname,
          pageTitle: document.title || 'Techno World Books',
          referrer: document.referrer || undefined,
          deviceType: detectedDevice,
          screenWidth: window.innerWidth,
          isPageview,
        }),
      }).catch(() => {});
    };

    // Immediate pulse when navigating to route = genuine pageview
    sendPulse(true);

    // Keepalive heartbeats every 25 seconds = NOT a new pageview, just active presence
    const interval = setInterval(() => {
      sendPulse(false);
    }, 25000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}


function PageLoader() {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
        <div className="absolute w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
      </div>
      <p className="mt-4 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Loading...</p>
    </div>
  );
}

// This is the customer layout that wraps around the customer-facing pages, including the header, footer, and a floating WhatsApp support button.
function CustomerLayout() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <HomePopupAd />
      {/* floating WhatsApp support */}
      <a
        href="https://wa.me/917479135626?text=Hi%20Techno%20World%20Books!%20I%20need%20help%20with%20my%20order."
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp Support"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:scale-105 hover:bg-emerald-600"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </>
  );
}

function CustomerStorefront() {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:category" element={<Listing />} />
        <Route path="/search" element={<Listing />} />
        <Route path="/book/:slug" element={<Product />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/track" element={<Track />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/terms-of-service" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/cancellation-refund" element={<RefundPolicy />} />
        <Route path="/cancellation-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/b2b" element={<Navigate to="/?b2b=true" replace />} />
        <Route path="/institutional" element={<Navigate to="/?b2b=true" replace />} />
        <Route path="/institutional-sales" element={<Navigate to="/?b2b=true" replace />} />
        <Route path="*" element={<Listing />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <StoreProvider>
        <AuthProvider>
          <ScrollToTop />
          <KeepAlivePing />
          <VisitorPulseTracker />
          <Toaster
            position="top-center"
            visibleToasts={1}
            expand={false}
            closeButton={false}
            swipeDirections={['top', 'left', 'right']}
            toastOptions={{
              className: 'bg-white text-zinc-900 border border-zinc-200/90 shadow-sm rounded-xl text-xs font-semibold dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800',
            }}
          />
          <ToastSwipeHandler />
          <ErrorBoundary>
            <CustomerStorefront />
          </ErrorBoundary>
        </AuthProvider>
      </StoreProvider>
    </CmsProvider>
  );
}
