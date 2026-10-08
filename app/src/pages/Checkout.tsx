import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { MapPin, CreditCard, CheckCircle2, Smartphone, Landmark, Wallet, Mail, Download, Tag, Loader2, ShieldCheck, AlertCircle, Truck, Sparkles, Package, Zap, Store, Clock, Building2, Info, CalendarCheck, Gift, Coins, Lock, Check } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { useCartTotals } from '@/hooks/useCartTotals';
import type { Address, Order } from '@/types';
import { toast } from 'sonner';
import { shippingService, profileService, orderService, paymentService } from '@/services/api';
import { downloadOrderInvoice } from '@/utils/generateInvoice';
import SEOHead from '@/components/SEOHead';

const PAYMENTS = [
  { id: 'upi', name: 'UPI', desc: 'GPay, PhonePe, Paytm & all UPI apps', icon: Smartphone },
  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', name: 'Net Banking', desc: 'All major Indian banks', icon: Landmark },
  { id: 'wallet', name: 'Wallets', desc: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet },
];

const INDIAN_STATES = ['West Bengal', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala', 'Bihar', 'Madhya Pradesh', 'Punjab', 'Odisha', 'Assam', 'Other'];

export default function Checkout() {
  const { cart, user, login, addresses: storeAddresses, addAddress, clearCart, applyCoupon, clearCoupon } = useStore();
  const [fulfillmentMode, setFulfillmentMode] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  void setFulfillmentMode; // Retained for future re-enabling of store pickup
  const [dbAddresses, setDbAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>('new');
  const [shippingMethod, setShippingMethod] = useState<string>('NORMAL_POST');
  const [payment, setPayment] = useState('upi');
  void setPayment;
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: (user?.email && !user.email.includes('technoworld.com') && !user.email.includes('google.dev') && !user.email.includes('@mail.com')) ? user.email : '',
    phone: user?.phone ?? '',
    line1: '',
    line2: '',
    postOffice: '',
    landmark: '',
    city: '',
    state: 'West Bengal',
    pincode: '',
    type: 'Home' as 'Home' | 'Work',
  });
  const [pickupForm, setPickupForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: (user?.email && !user.email.includes('technoworld.com') && !user.email.includes('google.dev') && !user.email.includes('@mail.com')) ? user.email : '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  // TechnoPoints & TechnoWallet Redemption State
  const [availablePoints, setAvailablePoints] = useState<number>(() => Number(user?.rewardPoints) || 0);
  const [availableWallet, setAvailableWallet] = useState<number>(0);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [customPoints, setCustomPoints] = useState<string>('');
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [customWallet, setCustomWallet] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (!token && !user) return;

    profileService.getPoints().then((res: any) => {
      if (res?.success && res?.data) {
        const livePts = Number(res.data.technoPoints) || 0;
        const liveWal = Number(res.data.technoWallet) || 0;
        setAvailablePoints(livePts);
        setAvailableWallet(liveWal);
        if (user && user.rewardPoints !== livePts) {
          login({ ...user, rewardPoints: livePts });
        }
      }
    }).catch(() => {});
  }, [user?.id, activeStep]);

  useEffect(() => {
    const token = localStorage.getItem('tw_customer_token') || localStorage.getItem('tw_token');
    if (!token && !user) return;

    profileService.getAddresses().then((res: any) => {
      if (res.success && Array.isArray(res.data)) {
        setDbAddresses(res.data);
      }
    }).catch(() => {});
  }, []);

  // Strict Address Deduplication & Normalization: supports both DB (fullName, addressLine1) and frontend (name, line1) schemas
  const addresses = useMemo(() => {
    const rawList = dbAddresses.length > 0 ? dbAddresses : storeAddresses;
    if (!rawList || !Array.isArray(rawList)) return [];
    const seen = new Set<string>();
    return rawList.filter((a: any) => {
      const line = (a.line1 || a.addressLine1 || '').trim().toLowerCase();
      const pin = (a.pincode || '').trim();
      const key = `${line}_${pin}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((a: any) => ({
      ...a,
      id: a.id || `addr_${Math.random().toString(36).substring(2, 9)}`,
      name: a.name || a.fullName || 'Valued Customer',
      fullName: a.fullName || a.name || 'Valued Customer',
      phone: a.phone || '',
      line1: a.line1 || a.addressLine1 || '',
      addressLine1: a.addressLine1 || a.line1 || '',
      line2: a.line2 || a.addressLine2 || '',
      addressLine2: a.addressLine2 || a.line2 || '',
      postOffice: a.postOffice || 'Local Post Office',
      city: a.city || '',
      state: a.state || 'West Bengal',
      pincode: a.pincode || '',
      type: a.type || 'Home',
    }));
  }, [dbAddresses, storeAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddr === 'new') {
      const def = addresses.find((a: any) => a.isDefault) || addresses[0];
      if (def) setSelectedAddr(def.id);
    }
  }, [addresses]);

  const selectedAddressObj = useMemo(() => {
    if (selectedAddr !== 'new') {
      return addresses.find((a: any) => a.id === selectedAddr);
    }
    return null;
  }, [selectedAddr, addresses]);

  const effectiveShippingMethod = fulfillmentMode === 'PICKUP' ? 'SELF_PICKUP' : shippingMethod;

  const activePincode = useMemo(() => {
    if (fulfillmentMode === 'PICKUP') return '700007';
    if (selectedAddressObj) {
      return selectedAddressObj.pincode;
    }
    const clean = form.pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length === 6 && /^[1-8]\d{5}$/.test(clean)) {
      return clean;
    }
    return undefined;
  }, [fulfillmentMode, selectedAddressObj, form.pincode]);

  const effectivePricingAddress = useMemo(() => {
    if (fulfillmentMode === 'PICKUP') {
      return {
        fullName: pickupForm.name || user?.name || 'Valued Customer',
        phone: pickupForm.phone || user?.phone || '',
        email: pickupForm.email || user?.email || '',
        addressLine1: 'Techno World Books Takeaway Desk, 90/6A Mahatma Gandhi Rd',
        pincode: '700007',
        city: 'Kolkata',
        state: 'West Bengal',
      };
    }
    if (selectedAddressObj) {
      return {
        fullName: selectedAddressObj.name || selectedAddressObj.fullName,
        phone: selectedAddressObj.phone,
        email: form.email,
        addressLine1: selectedAddressObj.line1 || selectedAddressObj.addressLine1,
        pincode: selectedAddressObj.pincode,
        city: selectedAddressObj.city,
        state: selectedAddressObj.state,
      };
    }
    return {
      fullName: (form as any).name || (form as any).fullName,
      phone: form.phone,
      email: form.email,
      addressLine1: (form as any).line1 || (form as any).addressLine1,
      pincode: form.pincode,
      city: form.city,
      state: form.state,
    };
  }, [fulfillmentMode, pickupForm, user, selectedAddressObj, form]);

  // 15% Subtotal margin guardrail for TechnoPoints (coins)
  // Max coins allowed is 15% of book subtotal, up to user's point balance
  // TechnoWallet cash remains 100% usable with 0 restrictions
  const cartSubtotal = useMemo(() => {
    return (cart || []).reduce((acc: number, item: any) => {
      const price = Number(item.price || item.unitPrice || (item as any).book?.price || 0);
      const qty = Number(item.qty || (item as any).quantity || 1);
      return acc + (price * qty);
    }, 0);
  }, [cart]);

  const maxAllowedPoints = Math.min(availablePoints, Math.floor(cartSubtotal * 0.15));

  const parsedPointsInput = customPoints.trim() === '' ? (usePoints ? maxAllowedPoints : 0) : Math.max(0, parseInt(customPoints, 10) || 0);
  const effectivePointsUsed = usePoints ? Math.min(parsedPointsInput, maxAllowedPoints) : 0;

  const parsedWalletInput = customWallet.trim() === '' ? (useWallet ? availableWallet : 0) : Math.max(0, parseFloat(customWallet) || 0);
  const effectiveWalletUsed = useWallet ? Math.min(parsedWalletInput, availableWallet) : 0;

  const {
    items,
    subtotal,
    shipping,
    codFee,
    isShippingCalculated,
    deliveryOptions,
    selectedShippingMethod,
    shippingZone,
    estimatedTransitDays,
    isAddonBundle,
    bundledWithOrderNumber,
    parentShippingMethod,
    parentShippingCharge,
    discount,
    pointsUsed,
    pointsDiscount,
    walletDiscount,
    userPointsBalance,
    userWalletBalance,
    total,
    appliedCoupon,
    couponError,
    isValid,
    errors,
    loading,
    error,
  } = useCartTotals(
    activePincode,
    selectedAddressObj?.id,
    effectivePricingAddress,
    effectiveShippingMethod,
    payment,
    effectivePointsUsed,
    effectiveWalletUsed
  );

  useEffect(() => {
    const pts = Number(userPointsBalance);
    const wal = Number(userWalletBalance);
    if (!isNaN(pts) && pts > availablePoints) {
      setAvailablePoints(pts);
    }
    if (!isNaN(wal) && wal > availableWallet) {
      setAvailableWallet(wal);
    }
  }, [userPointsBalance, userWalletBalance, availablePoints, availableWallet]);

  const effectiveDeliveryOptions = useMemo(() => {
    if (deliveryOptions && Array.isArray(deliveryOptions) && deliveryOptions.length > 0) {
      const valid = deliveryOptions.filter((opt: any) => opt && opt.eligible !== false);
      if (valid.length > 0) return valid;
    }
    const cleanPin = activePincode || form.pincode.replace(/\D/g, '').slice(0, 6);
    const isKolkata = cleanPin && /^700\d{3}$/.test(cleanPin);
    const standardFee = subtotal >= 999 ? 0 : 69;
    return [
      {
        method: 'NORMAL_POST',
        id: 'NORMAL_POST',
        label: 'Standard Delivery',
        description: subtotal >= 999 ? 'Free nationwide delivery' : 'Reliable delivery via postal network',
        price: standardFee,
        priceLabel: standardFee === 0 ? 'FREE' : `₹${standardFee}`,
        estimatedDays: '5–7 Business Days',
        eligible: true,
      },
      {
        method: 'SPEED_POST',
        id: 'SPEED_POST',
        label: 'Speed Post',
        description: 'Priority handling with real-time tracking',
        price: 199,
        priceLabel: '₹199',
        estimatedDays: '2–4 Business Days',
        eligible: true,
      },
      ...(isKolkata ? [{
        method: 'EXPRESS_LOCAL',
        id: 'EXPRESS_LOCAL',
        label: 'Express Delivery',
        description: 'Same-day local delivery partner (Porter / Rapido)',
        price: 149,
        priceLabel: '₹149',
        estimatedDays: 'Same Day',
        eligible: true,
      }] : []),
    ];
  }, [deliveryOptions, activePincode, form.pincode, subtotal]);

  useEffect(() => {
    if (fulfillmentMode === 'DELIVERY' && effectiveDeliveryOptions.length > 0) {
      const exists = effectiveDeliveryOptions.some((o: any) => (o.method || o.id) === shippingMethod);
      if (!exists) {
        setShippingMethod(effectiveDeliveryOptions[0].method || (effectiveDeliveryOptions[0] as any).id || 'NORMAL_POST');
      }
    }
  }, [effectiveDeliveryOptions, fulfillmentMode, shippingMethod]);

  const [pincodeStatus, setPincodeStatus] = useState<{
    loading: boolean;
    verified: boolean;
    postOffice?: string;
    error?: string;
  }>({ loading: false, verified: false });

  // Real-time India Post Pincode Lookup
  useEffect(() => {
    const cleanPin = form.pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length === 6) {
      setPincodeStatus({ loading: true, verified: false });
      shippingService
        .verifyPincode(cleanPin)
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const office = res.data[0];
            setPincodeStatus({
              loading: false,
              verified: true,
              postOffice: `${office.office_name}, ${office.state_name}`,
            });
            setForm((prev) => ({
              ...prev,
              city: prev.city || office.city_name || '',
              postOffice: prev.postOffice || office.office_name || '',
              state: INDIAN_STATES.includes(office.state_name) ? office.state_name : prev.state,
            }));
          } else {
            setPincodeStatus({
              loading: false,
              verified: false,
              error: `PIN code ${cleanPin} is non-existent or unserviceable`,
            });
          }
        })
        .catch((err) => {
          setPincodeStatus({
            loading: false,
            verified: false,
            error: err?.response?.data?.message || `Invalid or non-existent PIN code (${cleanPin})`,
          });
        });
    } else {
      setPincodeStatus({ loading: false, verified: false });
    }
  }, [form.pincode]);

  if (loading && items.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (error && (!items || items.length === 0)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Error Loading Cart Data</h2>
        <p className="text-sm mt-2">{error.message}</p>
        <Link to="/cart" className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white">Back to Cart</Link>
      </div>
    );
  }

  if (placed) {
    const placedDeliveryDate = (() => {
      try {
        const d = placed?.expectedDelivery ? new Date(placed.expectedDelivery) : null;
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : '3–5 Business Days';
      } catch {
        return '3–5 Business Days';
      }
    })();

    const placedAddrName = placed.address?.name || (placed.address as any)?.fullName || 'Valued Customer';
    const placedAddrPhone = placed.address?.phone || '';
    const placedAddrEmail = placed.address?.email || '';
    const placedAddrLine = placed.address?.line1 || (placed.address as any)?.addressLine1 || '';
    const placedAddrCity = placed.address?.city || '';
    const placedAddrPin = placed.address?.pincode || '';

    if (placed.courier === 'STORE_TAKEAWAY' || placed.trackingId?.startsWith('PICKUP-')) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <SEOHead
            title="Store Pickup Order Confirmed | Techno World Books"
            description="Your store pickup order confirmation."
            noIndex={true}
          />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-xs">
            <Store className="h-6 w-6 text-stone-200" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">Store Pickup Order Placed</h1>
          <p className="mt-1.5 text-xs text-stone-500 font-medium">
            Order <span className="font-mono font-semibold text-stone-800">#{placed.id}</span> &bull; {placed.items?.length || 0} item(s) &bull; <span className="font-semibold text-stone-900">{formatINR(placed.total)}</span> &bull; <span className="uppercase text-[11px] font-semibold text-stone-600">{placed.payment}</span>
          </p>
          <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 text-left shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-800" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-900">Store Takeaway Confirmed</span>
              </div>
              <span className="text-[11px] font-medium text-stone-500">Ready for scheduling</span>
            </div>
            <div className="mt-4 grid gap-3.5 text-xs text-stone-600 sm:grid-cols-2">
              <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3.5">
                <p className="text-[11px] text-stone-500 font-medium">Pickup Desk Location</p>
                <p className="mt-1 font-semibold text-stone-900">Techno World Books Dispatch Desk</p>
                <p className="mt-1 text-stone-600 leading-relaxed text-[11px]">
                  90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, College Street, Kolkata 700007
                </p>
              </div>
              <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3.5">
                <p className="text-[11px] text-stone-500 font-medium">Collector</p>
                <p className="mt-1 font-semibold text-stone-900">{placedAddrName}</p>
                <p className="mt-1 text-stone-600 text-[11px]">{placedAddrPhone ? `+91 ${placedAddrPhone}` : 'Phone on record'}</p>
                {placedAddrEmail && <p className="text-stone-400 text-[10.5px] mt-0.5">{placedAddrEmail}</p>}
              </div>
            </div>
            <div className="mt-4 rounded-md border border-stone-200 bg-stone-50/70 p-3.5 text-xs text-stone-700 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 text-stone-900">
                <CalendarCheck className="h-4 w-4 text-stone-700" /> Next Step: Choose Your Pickup Time Slot
              </p>
              <p className="mt-1 text-stone-600 text-[11.5px] leading-relaxed">
                Our warehouse team is preparing your books and will send available time slots to your <b>Notification Center</b> and <b>Order Details</b>. Select your slot and bring your invoice to collect your books.
              </p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/profile?tab=orders" className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800">
              View Order &amp; Pickup Slots
            </Link>
            <button
              type="button"
              onClick={() => downloadOrderInvoice(placed)}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-50 hover:border-stone-400"
            >
              <Download className="h-4 w-4 text-stone-500" />
              <span>Download Tax Invoice</span>
            </button>
            <Link to="/" className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50">
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <SEOHead
          title="Order Placed Successfully | Techno World Books"
          description="Your order confirmation and summary."
          noIndex={true}
        />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-xs">
          <CheckCircle2 className="h-7 w-7 text-emerald-400 stroke-[2.2]" />
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">Order Placed Successfully</h1>
        <p className="mt-1.5 text-xs text-stone-500 font-medium">
          Order <span className="font-mono font-semibold text-stone-800">#{placed.id}</span> &bull; {placed.items?.length || 0} item(s) &bull; <span className="font-semibold text-stone-900">{formatINR(placed.total)}</span> &bull; <span className="uppercase text-[11px] font-semibold text-stone-600">{placed.payment}</span>
        </p>

        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 text-left shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-800" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-900">Order Confirmed &amp; In Queue</span>
            </div>
            <span className="text-[11px] font-medium text-stone-500">Receipt emailed</span>
          </div>

          {/* Structured 4-Metric Grid (Clean layout, zero awkward text wrapping) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                <Truck className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span>Delivery Partner</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-stone-900">
                {placed.courier || 'India Post Speed Post'}
              </p>
            </div>

            <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                <Package className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span>Consignment / Tracking</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-stone-900 font-mono">
                {placed.trackingId || (
                  <span className="font-sans text-[11px] text-stone-500 font-medium">Assigned upon postal dispatch</span>
                )}
              </p>
            </div>

            <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span>Estimated Delivery</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-stone-900">
                {placedDeliveryDate}
              </p>
            </div>

            <div className="rounded-md border border-stone-200 bg-stone-50/50 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                <Coins className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                <span>TechnoPoints Earned</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-stone-900 font-mono">
                +{(placed as any).pointsEarned ?? Math.floor((placed.subtotal || placed.total || 0) / 100)} pts
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-stone-200 bg-stone-50/60 p-3.5 text-xs text-stone-600 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
              <div className="text-[11.5px] leading-relaxed">
                Official tracking details and your India Post postal barcode (AWB) will be automatically dispatched to <strong className="text-stone-900">{placedAddrEmail || 'your email'}</strong> once inspected and packed at College Street.
              </div>
            </div>
          </div>

          <p className="mt-4 border-t border-stone-100 pt-3 text-[11px] text-stone-500">
            <span className="font-medium text-stone-600">Shipping to: </span>
            {placedAddrName}{placedAddrLine ? `, ${placedAddrLine}` : ''}{placedAddrCity ? `, ${placedAddrCity}` : ''}{placedAddrPin ? ` — ${placedAddrPin}` : ''}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/track?id=${placed.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
          >
            <Truck className="h-4 w-4" />
            <span>Track Consignment</span>
          </Link>
          <button
            type="button"
            onClick={() => downloadOrderInvoice(placed)}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-50 hover:border-stone-400"
          >
            <Download className="h-4 w-4 text-stone-500" />
            <span>Download Tax Invoice</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  if (items?.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <SEOHead
          title="Checkout | Techno World Books"
          description="Secure checkout."
          noIndex={true}
        />
        <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h1 className="text-xl font-bold text-slate-800">Nothing to checkout</h1>
        <Link to="/" className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Browse Books</Link>
      </div>
    );
  }

  const getStrictUserEmail = () => {
    const enteredEmail = (form.email || pickupForm.email).trim();
    if (enteredEmail) return enteredEmail;
    // Only fallback to user.email if it's a real email, not a dummy OTP email
    if (user?.email && !user.email.includes('technoworld.com') && !user.email.includes('google.dev') && !user.email.includes('@mail.com')) {
      return user.email;
    }
    return '';
  };

  const handleProceedToDelivery = () => {
    const userEmail = getStrictUserEmail();
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      return toast.error('Valid Email ID is mandatory for order confirmation and tracking');
    }

    if (fulfillmentMode === 'PICKUP') {
      const collectorName = pickupForm.name.trim();
      const collectorPhone = pickupForm.phone.replace(/\D/g, '');
      if (!collectorName) return toast.error("Collector's Full Name is required for Store Pickup");
      if (!collectorPhone || collectorPhone.length < 10) {
        return toast.error("Please enter a valid 10-digit mobile phone number");
      }
      setActiveStep(2);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (selectedAddr !== 'new') {
      const chosen = addresses.find((a: any) => a.id === selectedAddr);
      if (!chosen) {
        return toast.error('Please select an address or add a new one');
      }
      if (!chosen.pincode || chosen.pincode.replace(/\D/g, '').length < 6) {
        return toast.error('Selected address does not have a valid 6-digit PIN code');
      }
      setActiveStep(2);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } else {
      if (!form.name.trim()) return toast.error('Full Name is required');
      if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
        return toast.error('Please enter a valid 10-digit mobile number');
      }
      if (!form.line1.trim()) return toast.error('Street Address / House No is required');
      if (!form.postOffice.trim()) return toast.error('Local Post Office Name is mandatory');
      if (!form.city.trim()) return toast.error('City is required');
      if (!form.pincode || form.pincode.replace(/\D/g, '').length < 6) {
        return toast.error('Please enter a valid 6-digit PIN code');
      }

      const newAddr: Address = {
        id: 'addr_' + Date.now(),
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, '').slice(0, 10),
        email: userEmail,
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        postOffice: form.postOffice.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.replace(/\D/g, '').slice(0, 6),
        type: form.type,
      };
      addAddress(newAddr);

      profileService.createAddress({
        fullName: newAddr.name,
        phone: newAddr.phone,
        addressLine1: newAddr.line1,
        addressLine2: newAddr.line2 || undefined,
        postOffice: newAddr.postOffice,
        landmark: newAddr.landmark || undefined,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        type: (newAddr.type || 'HOME').toUpperCase() as any,
        isDefault: addresses.length === 0,
      }).then((res: any) => {
        if (res.success && res.data) {
          setDbAddresses(prev => [...prev, res.data]);
          setSelectedAddr(res.data.id);
        }
      }).catch(() => {});

      setSelectedAddr(newAddr.id);
      setActiveStep(2);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleProceedToPayment = () => {
    if (fulfillmentMode === 'DELIVERY') {
      if (!shippingMethod) {
        setShippingMethod('NORMAL_POST');
      }
    }
    setActiveStep(3);
    window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    const userEmail = getStrictUserEmail();
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      return toast.error('Valid Email ID is mandatory to place an order');
    }

    if (fulfillmentMode === 'PICKUP') {
      const collectorName = pickupForm.name.trim();
      const collectorPhone = pickupForm.phone.replace(/\D/g, '');
      const collectorEmail = getStrictUserEmail();

      if (!collectorName) return toast.error("Collector's Full Name is required for Store Pickup");
      if (!collectorPhone || collectorPhone.length < 10) {
        return toast.error("Please enter a valid 10-digit mobile phone number for pickup notifications");
      }
      if (total > 0) {
        if (payment === 'cod') {
          return toast.error("Cash on Delivery is not available for Store Takeaway. Please pay online via UPI, Card, or Net Banking.");
        }
      }

      setIsSubmitting(true);
      try {
        const orderPayload = {
          items: items.map((i: any) => ({ bookId: i.bookId, quantity: i.quantity })),
          email: collectorEmail,
          customerEmail: collectorEmail,
          contactEmail: collectorEmail,
          shippingMethod: 'SELF_PICKUP',
          pickupName: collectorName,
          pickupPhone: collectorPhone,
          pickupEmail: collectorEmail,
          address: {
            fullName: collectorName,
            email: collectorEmail,
            phone: collectorPhone,
            addressLine1: 'Store Takeaway Desk - College Street Office',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700007',
          },
          paymentMethod: total === 0 ? 'REWARDS_AND_WALLET' : (PAYMENTS.find(p => p.id === payment)?.name || 'UPI'),
          couponCode: appliedCoupon ? appliedCoupon : undefined,
          pointsUsed: effectivePointsUsed > 0 ? effectivePointsUsed : undefined,
          walletUsed: effectiveWalletUsed > 0 ? effectiveWalletUsed : undefined,
        };

        let res;
        try {
          res = await orderService.create(orderPayload);
        } catch (firstErr: any) {
          if (firstErr.status === 401 || firstErr.message?.toLowerCase().includes('token') || firstErr.message?.toLowerCase().includes('auth')) {
            localStorage.removeItem('tw_customer_token');
            localStorage.removeItem('tw_customer_refresh_token');
            res = await orderService.create(orderPayload);
          } else {
            throw firstErr;
          }
        }
        const serverOrder = res.data;
        if (serverOrder.accessToken) {
          localStorage.setItem('tw_customer_token', serverOrder.accessToken);
        }
        if (serverOrder.refreshToken) {
          localStorage.setItem('tw_customer_refresh_token', serverOrder.refreshToken);
        }

        const finishOrder = () => {
          const createdOrder: Order = {
            id: serverOrder.orderNumber,
            items: items.map((i: any) => ({ bookId: i.bookId, qty: i.quantity, price: i.unitPrice })),
            subtotal,
            shipping: 0,
            discount,
            total: serverOrder.totalAmount,
            pointsEarned: serverOrder.pointsEarned ?? Math.floor((serverOrder.subtotal || subtotal) / 100),
            status: serverOrder.status,
            placedAt: new Date().toISOString(),
            payment: serverOrder.paymentMethod,
            address: {
              id: 'pickup_office',
              name: collectorName,
              phone: collectorPhone,
              email: collectorEmail,
              line1: '90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, College Street',
              postOffice: 'College Street SO',
              city: 'Kolkata',
              state: 'West Bengal',
              pincode: '700007',
              type: 'Work',
            },
            trackingId: 'PICKUP-APPOINTMENT-PENDING',
            courier: 'STORE_TAKEAWAY',
            expectedDelivery: new Date().toISOString(),
          };
          setPlaced(createdOrder);
          if (clearCart) clearCart();
          window.scrollTo(0, 0);
        };

        if (serverOrder.razorpayOrderId) {
          const { loadRazorpay } = await import('@/utils/loadRazorpay');
          const loaded = await loadRazorpay();
          if (!loaded) {
            throw new Error('Razorpay SDK failed to load. Are you online?');
          }

          const options = {
            key: serverOrder.razorpayKeyId,
            amount: Math.round(serverOrder.totalAmount * 100),
            currency: 'INR',
            name: 'Techno World Books',
            description: 'Store Pickup Order',
            image: 'https://res.cloudinary.com/tcsmyxe2/image/upload/v1789254075/techno_world_white_logo.png',
            order_id: serverOrder.razorpayOrderId,
            handler: async function (response: any) {
              try {
                toast.loading('Verifying payment with bank...', { id: 'rzp-verify' });
                await paymentService.verifyPayment({
                  orderId: serverOrder.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                toast.success('Payment verified successfully!', { id: 'rzp-verify' });
                finishOrder();
              } catch (verifyErr: any) {
                toast.error(verifyErr.message || 'Payment verification failed. Please contact support.', { id: 'rzp-verify' });
                setIsSubmitting(false);
              }
            },
            prefill: {
              name: collectorName,
              contact: collectorPhone,
              email: collectorEmail,
            },
            theme: {
              color: '#047857',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            toast.error('Payment failed: ' + response.error.description);
            setIsSubmitting(false);
          });
          rzp.open();
        } else {
          toast.success('Store pickup order placed successfully!');
          finishOrder();
          setIsSubmitting(false);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to place order');
        setIsSubmitting(false);
      }
      return;
    }

    let address: Address | undefined;
    const deliveryEmail = getStrictUserEmail();
    if (!deliveryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail)) {
      return toast.error('Valid Email ID is mandatory to place an order');
    }

    if (selectedAddr !== 'new') {
      const found = addresses.find((a: any) => a.id === selectedAddr);
      address = found || (addresses.length > 0 ? addresses[0] : undefined);
    }
    if (!address) {
      if (!form.name.trim()) return toast.error('Full Name is required');
      if (!form.phone || !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
        return toast.error('Please enter a valid 10-digit mobile number');
      }
      if (!form.line1.trim()) return toast.error('Address line (House no, Street) is required');
      if (!form.postOffice.trim()) return toast.error('Local Post Office name is mandatory');
      if (!form.city.trim()) return toast.error('City is required');
      if (!form.pincode || !/^\d{6}$/.test(form.pincode.replace(/\D/g, ''))) {
        return toast.error('Please enter a valid 6-digit PIN code');
      }

      address = {
        id: 'addr_' + Date.now(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: deliveryEmail,
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        postOffice: form.postOffice.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        type: form.type || 'Home',
      };
      addAddress(address);
    }
    setIsSubmitting(true);
    try {
      const resolvedAddressName = address.name || (address as any).fullName || form.name || 'Valued Customer';
      const resolvedAddressPhone = address.phone || form.phone || user?.phone || '';
      const resolvedAddressLine1 = address.line1 || (address as any).addressLine1 || form.line1 || 'Delivery Address';
      const resolvedAddressLine2 = (address as any).line2 || (address as any).addressLine2 || null;
      const resolvedAddressPO = (address as any).postOffice || form.postOffice || 'Local Post Office';
      const resolvedAddressLandmark = (address as any).landmark || form.landmark || null;
      const resolvedAddressCity = address.city || form.city || 'Kolkata';
      const resolvedAddressState = address.state || form.state || 'West Bengal';
      const resolvedAddressPincode = address.pincode || form.pincode || '700001';

      const orderPayload = {
        items: items.map((i: any) => ({ bookId: i.bookId, quantity: i.quantity })),
        addressId: address.id?.startsWith('addr_') ? undefined : address.id,
        email: userEmail,
        customerEmail: userEmail,
        contactEmail: userEmail,
        address: {
          fullName: resolvedAddressName,
          email: userEmail,
          phone: resolvedAddressPhone,
          addressLine1: resolvedAddressLine1,
          addressLine2: resolvedAddressLine2,
          postOffice: resolvedAddressPO,
          landmark: resolvedAddressLandmark,
          city: resolvedAddressCity,
          state: resolvedAddressState,
          pincode: resolvedAddressPincode,
        },
        paymentMethod: total === 0 ? 'REWARDS_AND_WALLET' : (payment === 'cod' ? 'COD' : (PAYMENTS.find(p => p.id === payment)?.name || 'UPI')),
        couponCode: appliedCoupon ? appliedCoupon : undefined,
        shippingMethod,
        pointsUsed: effectivePointsUsed > 0 ? effectivePointsUsed : undefined,
        walletUsed: effectiveWalletUsed > 0 ? effectiveWalletUsed : undefined,
      };

      let res;
      try {
        res = await orderService.create(orderPayload);
      } catch (firstErr: any) {
        if (firstErr.status === 401 || firstErr.message?.toLowerCase().includes('token') || firstErr.message?.toLowerCase().includes('auth')) {
          localStorage.removeItem('tw_customer_token');
          localStorage.removeItem('tw_customer_refresh_token');
          res = await orderService.create(orderPayload);
        } else {
          throw firstErr;
        }
      }
      const serverOrder = res.data;
      if (serverOrder.accessToken) {
        localStorage.setItem('tw_customer_token', serverOrder.accessToken);
      }
      if (serverOrder.refreshToken) {
        localStorage.setItem('tw_customer_refresh_token', serverOrder.refreshToken);
      }

      const finishOrder = () => {
        const finalConfirmedAddress: Address = {
          id: address?.id || 'addr_placed',
          name: resolvedAddressName,
          phone: resolvedAddressPhone,
          email: address?.email || userEmail,
          line1: resolvedAddressLine1,
          line2: resolvedAddressLine2 || '',
          postOffice: resolvedAddressPO,
          landmark: resolvedAddressLandmark || '',
          city: resolvedAddressCity,
          state: resolvedAddressState,
          pincode: resolvedAddressPincode,
          type: address?.type || 'Home',
        };

        const createdOrder: Order = {
          id: serverOrder.orderNumber,
          items: items.map((i: any) => ({ bookId: i.bookId, qty: i.quantity, price: i.unitPrice })),
          subtotal,
          shipping,
          discount,
          total: serverOrder.totalAmount,
          pointsEarned: serverOrder.pointsEarned ?? Math.floor((serverOrder.subtotal || subtotal) / 100),
          status: serverOrder.status || 'CONFIRMED',
          placedAt: new Date().toISOString(),
          payment: serverOrder.paymentMethod,
          address: finalConfirmedAddress,
          trackingId: '',
          courier: serverOrder.shippingCarrier || (shippingMethod === 'SPEED_POST' ? 'India Post Speed Post' : 'India Post Book Post'),
          expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        setPlaced(createdOrder);
        if (clearCart) clearCart();
        if (effectivePointsUsed > 0) {
          const nextPts = Math.max(0, availablePoints - effectivePointsUsed);
          setAvailablePoints(nextPts);
          if (user) login({ ...user, rewardPoints: nextPts });
        }
        if (effectiveWalletUsed > 0) {
          setAvailableWallet((prev) => Math.max(0, prev - effectiveWalletUsed));
        }
        window.scrollTo(0, 0);
      };

      if (total > 0 && payment !== 'cod' && serverOrder.razorpayOrderId) {
        const { loadRazorpay } = await import('@/utils/loadRazorpay');
        const loaded = await loadRazorpay();
        if (!loaded) {
          throw new Error('Razorpay SDK failed to load. Are you online?');
        }

        const options = {
          key: serverOrder.razorpayKeyId,
          amount: Math.round(serverOrder.totalAmount * 100),
          currency: 'INR',
          name: 'Techno World Books',
          description: 'Official Bookstore Order',
          image: 'https://res.cloudinary.com/tcsmyxe2/image/upload/v1789254075/techno_world_white_logo.png',
          order_id: serverOrder.razorpayOrderId,
          handler: async function (response: any) {
            try {
              toast.loading('Verifying payment with bank...', { id: 'rzp-verify' });
              await paymentService.verifyPayment({
                orderId: serverOrder.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Payment verified successfully!', { id: 'rzp-verify' });
              finishOrder();
            } catch (verifyErr: any) {
              toast.error(verifyErr.message || 'Payment verification failed. Please contact support.', { id: 'rzp-verify' });
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: (address as any)?.fullName || form.name || 'Valued Customer',
            email: userEmail,
            contact: (address as any)?.phone || form.phone,
          },
          theme: {
            color: '#047857' // Official Emerald
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error('Payment failed: ' + response.error.description);
          setIsSubmitting(false);
        });
        rzp.open();
        // Do not set isSubmitting to false yet, let handler or fail event do it
      } else {
        toast.success('Order placed successfully!');
        finishOrder();
        setIsSubmitting(false);
      }

    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <SEOHead
        title="Secure Checkout | Techno World Books"
        description="Complete your book order with secure payment."
        noIndex={true}
      />
      <h1 className="mb-5 font-serif text-2xl font-bold text-stone-900 tracking-tight">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* STEP 1: ADDRESS / PICKUP DETAILS */}
          {activeStep === 1 ? (
            fulfillmentMode === 'PICKUP' ? (
              /* STORE SELF-PICKUP DETAILS EXPANDED */
              <section className="rounded-lg border border-stone-300 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold text-white">1</span>
                    <Store className="h-4 w-4 text-emerald-800" /> Collector Information &amp; Pickup Desk
                  </p>
                  <span className="rounded-md bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[10px] font-semibold text-stone-700">Active Step</span>
                </div>

                {/* Collector Contact Form */}
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-stone-700">
                        Collector Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        value={pickupForm.name}
                        onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                        placeholder="Person who will collect the book"
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-stone-700">
                        Collector Mobile / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex rounded-md border border-stone-300 focus-within:border-stone-900">
                        <span className="flex items-center bg-stone-50 px-2.5 text-xs font-semibold text-stone-500 border-r border-stone-300">+91</span>
                        <input
                          value={pickupForm.phone}
                          onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          placeholder="10-digit mobile number"
                          className="w-full rounded-r-md px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">Can be different from your account if a friend or family member is collecting.</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-700">
                      Email Address for Official Tax Invoice <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={pickupForm.email}
                      onChange={(e) => setPickupForm({ ...pickupForm, email: e.target.value })}
                      placeholder="youremail@example.com"
                      type="email"
                      className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                    />
                    <p className="mt-1 text-[11px] text-stone-500">Invoice will be emailed here and available in your Account Center for pickup verification.</p>
                  </div>
                </div>

                {/* Store Address & Location Card */}
                <div className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-stone-200 p-2 text-stone-800 shrink-0 mt-0.5">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Techno World Books — College Street Dispatch Desk</p>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007
                      </p>
                      <p className="text-xs text-stone-500 mt-1.5 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        Operating Hours: Monday – Saturday, 11:00 AM – 7:30 PM (Per appointed slot)
                      </p>
                    </div>
                  </div>
                </div>

                {/* College Street Desk Pickup Note */}
                <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4 text-xs text-stone-600">
                  <div className="flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-stone-900">College Street Desk Pickup Information</p>
                      <p className="leading-relaxed text-stone-600">
                        For self-pickup orders, you can place your order online and present your order confirmation or official digital tax invoice at our College Street dispatch desk during your appointed time to collect your books.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleProceedToDelivery}
                    className="w-full sm:w-auto rounded-md bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Confirm Collector Info &amp; Continue →
                  </button>
                </div>
              </section>
            ) : (
              /* DELIVERY ADDRESS EXPANDED */
              <section className="rounded-lg border border-stone-300 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold text-white">1</span>
                    <MapPin className="h-4 w-4 text-emerald-800" /> Delivery Address
                  </p>
                  <span className="rounded-md bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[10px] font-semibold text-stone-700">Active Step</span>
                </div>

                {/* Mandatory Email for Order Confirmation */}
                <div className="mb-4 rounded-lg bg-stone-50 p-3.5 border border-stone-200">
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Customer Email ID <span className="text-rose-600">* (Mandatory for order invoices &amp; tracking)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. yourname@gmail.com"
                    required
                    className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900 shadow-xs"
                  />
                </div>

                {addresses?.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {addresses.map((a: any) => (
                      <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${selectedAddr === a.id ? 'border-stone-900 bg-stone-50 shadow-xs' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                        <input type="radio" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="mt-1" />
                        <span className="text-sm">
                          <b className="text-stone-900">{a.name || a.fullName}</b> <span className="rounded-md bg-stone-200/70 border border-stone-300 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700">{a.type || 'HOME'}</span><br />
                          <span className="text-stone-600 text-xs mt-0.5 block leading-relaxed">
                            {a.line1 || a.addressLine1}
                            {(a.line2 || a.addressLine2) ? `, ${a.line2 || a.addressLine2}` : ''}
                            {(a.postOffice || a.localPostOffice) ? `, PO: ${a.postOffice || a.localPostOffice}` : ''}
                            , {a.city}, {a.state} — <b>{a.pincode}</b> · +91 {a.phone}
                          </span>
                        </span>
                      </label>
                    ))}
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold transition-colors ${selectedAddr === 'new' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                      <input type="radio" checked={selectedAddr === 'new'} onChange={() => setSelectedAddr('new')} /> + Add a new address
                    </label>
                  </div>
                )}

                {selectedAddr === 'new' && (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Full Name *</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Mobile Number *</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit Mobile Number *" type="tel" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">Street Address / House No *</label>
                      <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House/Flat No., Building Name, Street *" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">Apartment, Suite, Unit (optional)</label>
                      <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Apartment, Suite, Unit, etc. (optional)" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900" />
                    </div>
                    
                    {/* Mandatory Post Office Name Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Local Post Office Name <span className="text-rose-600">* (Mandatory for postal dispatch)</span>
                      </label>
                      <input
                        value={form.postOffice}
                        onChange={(e) => setForm({ ...form, postOffice: e.target.value })}
                        placeholder="e.g. Bowbazar SO, Park Street PO, College Street SO"
                        required
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">Landmark (optional)</label>
                      <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Landmark (e.g. Near Metro Station)" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">City / District *</label>
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City *" className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">State *</label>
                        <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900 bg-white">
                          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">PIN Code *</label>
                        <div className="flex gap-2">
                          <input
                            value={form.pincode}
                            onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                            placeholder="6-digit Pincode"
                            inputMode="numeric"
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                          />
                          <div className="flex shrink-0 gap-1.5">
                            {(['Home', 'Work'] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setForm({ ...form, type: t })}
                                className={`rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                                  form.type === t
                                    ? 'border-stone-900 bg-stone-900 text-white'
                                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* India Post Pincode Deliverability Feedback */}
                    {pincodeStatus.loading && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-500">
                        <Loader2 className="h-3 w-3 animate-spin text-stone-600" /> Verifying postal delivery via India Post...
                      </p>
                    )}
                    {pincodeStatus.verified && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
                        Speed Post Deliverable: {pincodeStatus.postOffice}
                      </p>
                    )}
                    {pincodeStatus.error && form.pincode.length === 6 && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                        {pincodeStatus.error}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleProceedToDelivery}
                    className="w-full sm:w-auto rounded-md bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Deliver to this Address →
                  </button>
                </div>
              </section>
            )
          ) : (
            /* STEP 1 COLLAPSED / COMPLETED */
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-800 text-white mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      {fulfillmentMode === 'PICKUP' ? '1. STORE PICKUP DETAILS' : '1. DELIVERY ADDRESS'}
                    </span>
                    <span className="rounded-md bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-semibold px-2 py-0.5">Confirmed</span>
                  </div>
                  {fulfillmentMode === 'PICKUP' ? (
                    <div className="mt-1 text-sm font-semibold text-stone-800">
                      <span>{pickupForm.name || user?.name}</span> · <span className="text-stone-600">+91 {pickupForm.phone || user?.phone}</span> · <span className="text-stone-500 font-normal">{pickupForm.email || form.email}</span>
                      <p className="text-xs text-stone-500 font-normal mt-0.5">Techno World Books — College Street Dispatch Desk (Appointed Slot)</p>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-stone-800">
                      <span>{selectedAddressObj?.name || selectedAddressObj?.fullName || form.name}</span> · <span className="text-stone-600">+91 {selectedAddressObj?.phone || form.phone}</span>
                      <p className="text-xs text-stone-600 font-normal mt-0.5 leading-relaxed">
                        {selectedAddressObj?.line1 || selectedAddressObj?.addressLine1 || form.line1}
                        {(selectedAddressObj?.line2 || selectedAddressObj?.addressLine2 || form.line2) ? `, ${selectedAddressObj?.line2 || selectedAddressObj?.addressLine2 || form.line2}` : ''}
                        {(selectedAddressObj?.postOffice || form.postOffice) ? `, PO: ${selectedAddressObj?.postOffice || form.postOffice}` : ''}
                        , {selectedAddressObj?.city || form.city}, {selectedAddressObj?.state || form.state} — <b>{selectedAddressObj?.pincode || form.pincode}</b>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="shrink-0 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* STEP 2: CHOOSE DELIVERY METHOD */}
          {activeStep === 1 ? (
            /* Inactive Step 2 placeholder */
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-200 text-xs font-semibold text-stone-600">2</span>
                <div>
                  <p className="text-sm font-semibold text-stone-700">2. Choose Delivery Method</p>
                  <p className="text-xs text-stone-400">Confirm delivery address above to select shipping speed</p>
                </div>
              </div>
            </div>
          ) : activeStep === 2 ? (
            /* Active Step 2 expanded */
            <section className="rounded-lg border border-stone-300 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold text-white">2</span>
                  {fulfillmentMode === 'PICKUP' ? (
                    <>
                      <Store className="h-4 w-4 text-emerald-800" /> Fulfillment Method
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 text-emerald-800" /> Choose Delivery Method
                    </>
                  )}
                </p>
                <span className="rounded-md bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[10px] font-semibold text-stone-700">Active Step</span>
              </div>

              {fulfillmentMode === 'PICKUP' ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Store className="h-5 w-5 text-emerald-800" />
                        <div>
                          <p className="text-sm font-semibold text-stone-900">Store Self-Pickup (College Street Desk)</p>
                          <p className="text-xs text-stone-600 mt-0.5">Ready per appointed time slot · Zero shipping fee</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-emerald-800 px-2.5 py-1 text-xs font-semibold text-white">FREE</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-2.5 border-t border-stone-200 pt-2 leading-relaxed">
                      Once your order is placed, our warehouse team will prepare your books and offer <b>3 to 4 pickup time slots</b> in your Notification Center &amp; Order Details. Choose your preferred slot and collect your books!
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full sm:w-auto rounded-md bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Payment Method →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isAddonBundle && (
                    <div className="rounded-lg border border-stone-300 bg-stone-50 p-4 text-xs text-stone-900 flex items-start gap-3 shadow-xs">
                      <Sparkles className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                          Active Dispatch Consignment #{bundledWithOrderNumber}
                        </p>
                        <p className="text-stone-600 mt-1 leading-relaxed text-xs">
                          You already have an order scheduled for today&apos;s 2:00 PM dispatch batch for this delivery address{parentShippingMethod ? ` (currently via ${parentShippingMethod === 'EXPRESS_LOCAL' ? 'Express' : parentShippingMethod === 'SPEED_POST' ? 'Speed Post' : 'Standard Post'})` : ''}. You can join your active shipment for <b>FREE (₹0)</b>, or upgrade the entire parcel to a faster delivery service below{parentShippingCharge > 0 ? ` (your previously paid delivery fee of ${formatINR(parentShippingCharge)} is credited)` : ''}!
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {effectiveDeliveryOptions.map((opt: any) => {
                      const methodId = opt.method || opt.id;
                      const isSelected = shippingMethod === methodId;
                      const Icon = methodId === 'SPEED_POST' ? Zap : methodId === 'EXPRESS_LOCAL' ? Truck : Package;
                      return (
                        <label
                          key={methodId}
                          className={`relative flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors ${
                            isSelected 
                              ? 'border-emerald-800 bg-stone-50 ring-1 ring-emerald-800'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="absolute inset-y-0 left-0 w-1 rounded-l-lg bg-emerald-800" />}
                          <div className="flex items-start justify-between gap-3 ml-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={isSelected}
                                onChange={() => setShippingMethod(methodId)}
                                className="mt-0.5 accent-emerald-800"
                              />
                              <div>
                                <p className={`text-sm font-semibold flex items-center gap-1.5 ${isSelected ? 'text-stone-900' : 'text-stone-800'}`}>
                                  <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-800' : 'text-stone-400'}`} />
                                  {opt.label}
                                </p>
                                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{opt.description}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-stone-900">
                                {opt.price === 0 ? <span className="text-emerald-800">FREE</span> : formatINR(opt.price)}
                              </p>
                              <p className="text-[10px] font-medium text-stone-500 mt-1 whitespace-nowrap">{opt.estimatedDays}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full sm:w-auto rounded-md bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Payment Method →
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            /* Step 2 Collapsed / Completed */
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-800 text-white mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      {fulfillmentMode === 'PICKUP' ? '2. FULFILLMENT METHOD' : '2. DELIVERY METHOD'}
                    </span>
                    <span className="rounded-md bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-semibold px-2 py-0.5">Confirmed</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-stone-800">
                    {fulfillmentMode === 'PICKUP' ? (
                      <span>Store Takeaway (College Street Desk) · <b className="text-emerald-800">FREE</b></span>
                    ) : (
                      (() => {
                        const chosen = effectiveDeliveryOptions.find((o: any) => (o.method || o.id) === shippingMethod) || effectiveDeliveryOptions[0];
                        return (
                          <span>
                            <b>{chosen?.label}</b> · <span className="text-emerald-800 font-semibold">{chosen?.price === 0 ? 'FREE' : formatINR(chosen?.price)}</span>
                            <span className="text-xs text-stone-500 font-normal ml-1">({chosen?.estimatedDays})</span>
                          </span>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="shrink-0 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {activeStep < 3 ? (
            /* Inactive Step 3 placeholder */
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-200 text-xs font-semibold text-stone-600">3</span>
                <div>
                  <p className="text-sm font-semibold text-stone-700">3. Payment Method</p>
                  <p className="text-xs text-stone-400">Choose delivery method above to proceed to payment</p>
                </div>
              </div>
            </div>
          ) : (
            /* Active Step 3 expanded */
            <section className="rounded-lg border border-stone-300 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-900 text-xs font-semibold text-white">3</span>
                  <CreditCard className="h-4 w-4 text-emerald-800" /> Payment Method & Rewards
                </p>
                <span className="rounded-md bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[10px] font-semibold text-stone-700">Active Step</span>
              </div>

              {/* TechnoRewards & TechnoWallet Redemption Box */}
              <div className="mb-5 rounded-lg border border-stone-200 bg-stone-50/50 p-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-200 text-stone-800">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 tracking-tight">Loyalty Coins & Wallet Cash</h4>
                      <p className="text-xs text-stone-500">Apply balance towards this order</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                    STACKABLE
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {/* Option 1: TechnoPoints Coins */}
                  <div className={`rounded-lg border p-3 transition-colors ${usePoints ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        disabled={maxAllowedPoints <= 0}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUsePoints(checked);
                          if (checked && !customPoints) {
                            setCustomPoints(String(maxAllowedPoints));
                          }
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                            <Coins className="h-3.5 w-3.5 text-stone-700" /> TechnoPoints
                          </span>
                          <span className="rounded-md bg-stone-100 border border-stone-200 px-1.5 py-0.2 text-[10px] font-semibold text-stone-800">
                            {availablePoints} pts
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-0.5">1 Point = ₹1.00 instant discount</p>
                      </div>
                    </label>

                    {usePoints && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              min="0"
                              max={maxAllowedPoints}
                              value={customPoints}
                              onChange={(e) => setCustomPoints(e.target.value)}
                              placeholder={`Max ${maxAllowedPoints}`}
                              className="w-full rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-stone-400">pts</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomPoints(String(maxAllowedPoints))}
                            className="rounded-md bg-stone-200 px-2 py-1 text-[11px] font-semibold text-stone-900 hover:bg-stone-300 transition-colors shrink-0"
                          >
                            Max
                          </button>
                        </div>
                        {effectivePointsUsed > 0 && (
                          <p className="mt-1 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Saving ₹{effectivePointsUsed}.00 with coins
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option 2: TechnoWallet Cash */}
                  <div className={`rounded-lg border p-3 transition-colors ${useWallet ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        disabled={availableWallet <= 0}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUseWallet(checked);
                          if (checked && !customWallet) {
                            setCustomWallet(String(availableWallet));
                          }
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                            <Wallet className="h-3.5 w-3.5 text-stone-700" /> TechnoWallet
                          </span>
                          <span className="rounded-md bg-stone-100 border border-stone-200 px-1.5 py-0.2 text-[10px] font-semibold text-stone-800">
                            ₹{Number(availableWallet || 0).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-0.5">₹1 Cash = ₹1.00 instant deduction</p>
                      </div>
                    </label>

                    {useWallet && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              max={availableWallet}
                              value={customWallet}
                              onChange={(e) => setCustomWallet(e.target.value)}
                              placeholder={`Max ${Number(availableWallet || 0).toFixed(2)}`}
                              className="w-full rounded-md border border-stone-300 bg-white pl-5 pr-2.5 py-1 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomWallet(String(availableWallet))}
                            className="rounded-md bg-stone-200 px-2 py-1 text-[11px] font-semibold text-stone-900 hover:bg-stone-300 transition-colors shrink-0"
                          >
                            Max
                          </button>
                        </div>
                        {effectiveWalletUsed > 0 && (
                          <p className="mt-1 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Using ₹{Number(effectiveWalletUsed || 0).toFixed(2)} wallet cash
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* If order is completely paid with Rewards & Wallet */}
              {total === 0 ? (
                <div className="my-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center shadow-xs">
                  <p className="text-sm font-semibold text-stone-900 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-800" />
                    <span>Order 100% Covered by TechnoRewards &amp; Wallet!</span>
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    Zero out-of-pocket payable (₹0.00). No online payment required.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-900 text-white shadow-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-stone-900">Razorpay Secure Online Payment</span>
                      <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700 shrink-0">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Choose UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking or Wallets in the next window
                    </p>
                  </div>
                </div>
              )}

              {/* Secure Payment Guarantee */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-500">
                <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
                <span>256-bit Bank Grade Encrypted &bull; Razorpay Certified</span>
              </div>

              {/* Place Order button in Step 3 */}
              <div className="mt-4 border-t border-stone-200 pt-4">
                <button
                  disabled={isSubmitting || !isValid}
                  onClick={handlePlaceOrder}
                  className="w-full rounded-md bg-emerald-800 hover:bg-emerald-900 py-3.5 text-sm font-semibold text-white shadow-xs disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing Order...
                    </>
                  ) : total === 0 ? (
                    'Confirm Free Order with Rewards (₹0.00)'
                  ) : (
                    `Pay ${formatINR(total)} Securely →`
                  )}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* summary */}
        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:sticky lg:top-36">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Order Summary</p>

          {/* Same-Batch Free Add-on Shipping Notification */}
          {isAddonBundle && (
            <div className="mb-4 rounded-lg border border-stone-300 bg-stone-50 p-3 text-xs text-stone-900 shadow-xs flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">
                  Free Add-on Delivery Activated (₹0 Shipping)!
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  You already placed order <span className="font-semibold font-mono">#{bundledWithOrderNumber}</span> in today&apos;s 2:00 PM dispatch batch for this same delivery address. This book will be bundled into your <b>same parcel</b> at <b>no extra delivery charge</b>!
                </p>
              </div>
            </div>
          )}

          <div className="max-h-48 space-y-2 overflow-auto border-b border-dashed border-stone-200 pb-3">
            {items.map((i: any) => (
              <div key={i.bookId} className="flex justify-between gap-2 text-sm">
                <span className="line-clamp-1 text-stone-600">{i.title} × {i.quantity}</span>
                <span className="shrink-0 font-medium text-stone-900">{formatINR(i.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Quick Rewards balance reminder */}
          {(availablePoints > 0 || availableWallet > 0) && (
            <div className="mb-3 rounded-md bg-stone-50 border border-stone-200 p-2.5 text-xs flex items-center justify-between text-stone-800">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700">
                <Sparkles className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                <span>Rewards available:</span>
              </span>
              <div className="flex items-center gap-2.5 text-[11px] font-semibold text-stone-800">
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                  <span>{Number(availablePoints || 0)} pts</span>
                </span>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                  <span>₹{Number(availableWallet || 0).toFixed(0)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Coupon Code Section in Checkout */}
          <div className="my-3 border-b border-dashed border-stone-200 pb-3">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-md bg-stone-50 border border-stone-200 p-2.5 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-stone-800">
                  <Tag className="h-3.5 w-3.5 text-emerald-800" /> &ldquo;{appliedCoupon}&rdquo; applied ({formatINR(discount)} OFF)
                </span>
                <button onClick={clearCoupon} className="font-semibold text-stone-600 hover:text-rose-600 underline transition-colors cursor-pointer">Remove</button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. TEST20)"
                    className="w-full rounded-md border border-stone-300 px-3 py-1.5 text-xs outline-none focus:border-stone-900 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!couponInput.trim()) return toast.error('Enter a promo code');
                      applyCoupon(couponInput.trim());
                    }}
                    className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-stone-600">Subtotal</dt><dd className="font-medium text-stone-900">{formatINR(subtotal)}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-stone-600">Coupon discount</dt>
                <dd className="font-medium text-emerald-800">− {formatINR(discount)}</dd>
              </div>
            )}
            {pointsDiscount > 0 && (
              <div className="flex justify-between items-center text-stone-700">
                <dt className="flex items-center gap-1.5 font-medium text-xs">
                  <Coins className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                  <span>TechnoPoints ({pointsUsed} pts)</span>
                </dt>
                <dd className="font-medium text-emerald-800">− {formatINR(pointsDiscount)}</dd>
              </div>
            )}
            {walletDiscount > 0 && (
              <div className="flex justify-between items-center text-stone-700">
                <dt className="flex items-center gap-1.5 font-medium text-xs">
                  <Wallet className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                  <span>TechnoWallet Cash</span>
                </dt>
                <dd className="font-medium text-emerald-800">− {formatINR(walletDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between items-center">
              <dt className="text-stone-600">Delivery</dt>
              <dd>
                {fulfillmentMode === 'PICKUP' ? (
                  <span className="font-semibold text-emerald-800">FREE</span>
                ) : isShippingCalculated ? (
                  shipping === 0 ? (
                    <span className="font-semibold text-emerald-800">FREE</span>
                  ) : (
                    <span className="font-medium text-stone-900">{formatINR(shipping)}</span>
                  )
                ) : (
                  <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                    Calculated at address step
                  </span>
                )}
              </dd>
            </div>

            {fulfillmentMode === 'PICKUP' ? (
              <div className="rounded-md bg-stone-50 border border-stone-200 p-2.5 text-[11px] text-stone-600 flex items-center gap-2">
                <Store className="h-4 w-4 text-stone-500 shrink-0" />
                <span>Store Takeaway · College Street Desk · <b className="text-stone-800">Appointed Slot</b></span>
              </div>
            ) : isShippingCalculated && (
              <div className="rounded-md bg-stone-50 border border-stone-200 p-2.5 text-[11px] text-stone-600 flex items-center gap-2">
                <Truck className="h-4 w-4 text-stone-500 shrink-0" />
                <span>{deliveryOptions?.find((o: any) => (o.method || o.id) === (selectedShippingMethod || shippingMethod))?.label || shippingZone} · Est. <b className="text-stone-800">{estimatedTransitDays}</b></span>
              </div>
            )}

            {payment === 'cod' && (
              <div className="flex justify-between items-center">
                <dt className="text-stone-600">COD Handling Fee</dt>
                <dd className="font-medium text-stone-900">+ {formatINR(codFee || 20)}</dd>
              </div>
            )}

            <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            {!isShippingCalculated && (
              <p className="text-[10px] text-stone-400 text-right">Delivery fee added once address + pincode is confirmed</p>
            )}
          </dl>
          {errors && errors?.length > 0 && (
            <div className="mt-3 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <ul className="list-inside list-disc">
                {errors.map((e: any, i: number) => (
                  <li key={i}>{typeof e === 'string' ? e : e?.message || JSON.stringify(e)}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Techno Points Reward Preview */}
          <div className="mt-4 rounded-md border border-stone-200 bg-stone-50/60 p-3 flex items-center gap-3">
            <Gift className="h-5 w-5 text-emerald-800 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-stone-900">Earn {Math.floor(total / 100)} Techno Points</p>
              <p className="text-[10px] text-stone-500 font-medium">1 Point per ₹100 spent · Valid for 1 year upon delivery</p>
            </div>
          </div>

          {activeStep === 1 ? (
            <button
              type="button"
              onClick={handleProceedToDelivery}
              className="mt-4 w-full rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Continue to Delivery Method →
            </button>
          ) : activeStep === 2 ? (
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="mt-4 w-full rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Continue to Payment →
            </button>
          ) : (
            <button
              disabled={isSubmitting || !isValid}
              onClick={handlePlaceOrder}
              className="mt-4 w-full rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-900 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Processing...' : payment === 'cod' ? `Place Order · ${formatINR(total)}` : `Pay ${formatINR(total)} Securely`}
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-stone-400 shrink-0" />
            <span>256-bit SSL encrypted · PCI-DSS compliant · Razorpay Verified</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
