import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/store/StoreContext';
import { pricingService } from '@/services/api';

export function useCartTotals(
  pincode?: string,
  addressId?: string,
  address?: any,
  shippingMethod: string = 'NORMAL_POST',
  paymentMethod: string = 'upi',
  pointsUsed: number = 0,
  walletUsed: number = 0
) {
  const { cart, coupon, user } = useStore();
  const [pricing, setPricing] = useState<any>(null);
  const pricingRef = useRef<any>(null);
  pricingRef.current = pricing;

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<{status: number, message: string} | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPricing() {
      if (cart?.length === 0) {
        setPricing({
          items: [],
          subtotal: 0,
          mrpTotal: 0,
          shippingCharge: 0,
          codFee: 0,
          isShippingCalculated: false,
          shippingMessage: 'Enter pincode at address step',
          couponDiscount: 0,
          totalAmount: 0,
          totalSavings: 0,
          pointsUsed: 0,
          pointsDiscount: 0,
          walletUsed: 0,
          walletDiscount: 0,
          couponCode: null,
          isValid: true,
          errors: []
        });
        setLoading(false);
        setIsUpdating(false);
        setError(null);
        return;
      }
      try {
        if (!pricingRef.current) {
          setLoading(true);
        } else {
          setIsUpdating(true);
        }
        setError(null);
        
        const validCart = cart.map(i => ({
          bookId: i.bookId || (i as any).id,
          quantity: i.qty || (i as any).quantity || 1
        })).filter(i => i.bookId);

        if (validCart?.length === 0) {
          setPricing({
            items: [], subtotal: 0, mrpTotal: 0, shippingCharge: 0, codFee: 0, isShippingCalculated: false, shippingMessage: 'Enter pincode at address step', couponDiscount: 0, totalAmount: 0, totalSavings: 0, pointsUsed: 0, pointsDiscount: 0, walletUsed: 0, walletDiscount: 0, couponCode: null, isValid: true, errors: []
          });
          setLoading(false);
          setIsUpdating(false);
          return;
        }

        let effectiveUserId = (user as any)?.id || (user as any)?.userId;

        const payload: any = {
          items: validCart,
          couponCode: coupon,
          userId: effectiveUserId || undefined,
          email: user?.email || undefined,
          userEmail: user?.email || undefined,
          phone: user?.phone || undefined,
          pincode: pincode || undefined,
          addressId: addressId || undefined,
          address: address || undefined,
          shippingMethod: shippingMethod,
          paymentMethod: paymentMethod === 'cod' ? 'COD' : (paymentMethod || 'UPI'),
          pointsUsed: pointsUsed > 0 ? pointsUsed : undefined,
          walletUsed: walletUsed > 0 ? walletUsed : undefined,
        };

        const res = await pricingService.calculate(payload);
        
        if (active) {
          setPricing(res.data);
          setError(null);
        }
      } catch (err: any) {
        if (active) {
          console.warn("Pricing recalculation non-fatal warning:", err);
          // Only show fatal error if initial load has no pricing at all
          if (!pricingRef.current) {
            setError({
              status: err?.status || 500,
              message: err?.message || 'Failed to calculate pricing.'
            });
          }
        }
      } finally {
        if (active) {
          setLoading(false);
          setIsUpdating(false);
        }
      }
    }

    // Fire immediately on initial load; debounce rapid quantity taps by 150ms
    const delay = pricingRef.current ? 150 : 0;
    const timeout = setTimeout(loadPricing, delay);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [cart, coupon, user, pincode, addressId, JSON.stringify(address), shippingMethod, paymentMethod, pointsUsed, walletUsed]);

  const rawPromoCode = pricing?.promotionCode || pricing?.couponCode || null;
  const promoError = pricing?.promotionError || pricing?.couponError || null;
  const discount = Number(pricing?.promotionDiscount ?? pricing?.couponDiscount ?? 0);
  const pointsDiscount = Number(pricing?.pointsDiscount || 0);
  const walletDiscount = Number(pricing?.walletDiscount || 0);

  // Instant optimistic items & totals derived synchronously from live `cart` state
  const optimistic = useMemo(() => {
    const rawItems: any[] = pricing?.items || [];
    if (!cart || cart.length === 0) {
      return {
        items: [],
        subtotal: 0,
        mrpTotal: 0,
        shipping: 0,
        baseTotal: 0,
      };
    }

    const cartMap = new Map<string, number>();
    for (const c of cart) {
      const id = c.bookId || (c as any).id;
      if (id) cartMap.set(String(id), Number(c.qty || (c as any).quantity || 1));
    }

    let isOutOfSync = rawItems.length !== cartMap.size;
    const mappedItems: any[] = [];

    for (const pItem of rawItems) {
      const liveQty = cartMap.get(String(pItem.bookId));
      if (liveQty === undefined) {
        isOutOfSync = true;
        continue; // Item was removed or saved for later — hide immediately
      }
      const serverQty = Number(pItem.quantity || 1);
      if (liveQty !== serverQty) {
        isOutOfSync = true;
        const unitPrice = Number(
          pItem.unitPrice ?? pItem.price ?? (serverQty > 0 ? Number(pItem.totalPrice || 0) / serverQty : 0)
        );
        const unitMrp = Number(
          pItem.unitMrp ?? pItem.mrp ?? (serverQty > 0 ? Number(pItem.totalMrp || 0) / serverQty : unitPrice)
        );
        mappedItems.push({
          ...pItem,
          quantity: liveQty,
          totalPrice: Math.round(unitPrice * liveQty * 100) / 100,
          totalMrp: Math.round(unitMrp * liveQty * 100) / 100,
        });
      } else {
        mappedItems.push(pItem);
      }
    }

    if (!isOutOfSync) {
      return {
        items: rawItems,
        subtotal: Number(pricing?.subtotal || 0),
        mrpTotal: Number(pricing?.mrpTotal || 0),
        shipping: Number(pricing?.shippingCharge || 0),
        baseTotal: Number(pricing?.totalAmount || 0),
      };
    }

    const optSubtotal = Math.round(mappedItems.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0) * 100) / 100;
    const optMrpTotal = Math.round(mappedItems.reduce((sum, i) => sum + Number(i.totalMrp || 0), 0) * 100) / 100;
    const serverShipping = Number(pricing?.shippingCharge || 0);
    const serverCod = Number(pricing?.codFee || 0);
    const optBaseTotal = Math.max(
      0,
      Math.round((optSubtotal - discount - pointsDiscount - walletDiscount + serverShipping + serverCod) * 100) / 100
    );

    return {
      items: mappedItems,
      subtotal: optSubtotal,
      mrpTotal: optMrpTotal,
      shipping: serverShipping,
      baseTotal: optBaseTotal,
    };
  }, [cart, pricing, discount, pointsDiscount, walletDiscount]);

  const effectiveCodFee = paymentMethod === 'cod' ? Number(pricing?.codFee || 20) : 0;
  const baseTotal = optimistic.baseTotal;
  const pricingHadCod = Number(pricing?.codFee || 0) > 0;
  const effectiveTotal = (paymentMethod === 'cod' && !pricingHadCod && baseTotal > 0)
    ? Number((Number(baseTotal || 0) + 20).toFixed(2))
    : Number(baseTotal || 0);

  return { 
    items: optimistic.items, 
    subtotal: optimistic.subtotal, 
    mrpTotal: optimistic.mrpTotal, 
    shipping: optimistic.shipping, 
    codFee: effectiveCodFee,
    isShippingCalculated: Boolean(pricing?.isShippingCalculated),
    isExpressEligible: Boolean(pricing?.isExpressEligible),
    deliveryOptions: pricing?.deliveryOptions || [],
    selectedShippingMethod: pricing?.selectedShippingMethod || shippingMethod,
    shippingZone: pricing?.shippingZone || 'Pending Address',
    shippingMessage: pricing?.shippingMessage || 'Calculated at address step',
    estimatedTransitDays: pricing?.estimatedTransitDays || '3–4 Business Days',
    isAddonBundle: Boolean(pricing?.isAddonBundle),
    bundledWithOrderNumber: pricing?.bundledWithOrderNumber || null,
    parentShippingMethod: pricing?.parentShippingMethod || null,
    parentShippingCharge: pricing?.parentShippingCharge || 0,
    discount, 
    pointsUsed: Number(pricing?.pointsUsed || 0),
    pointsDiscount,
    maxPointsAllowed: pricing?.maxPointsAllowed !== undefined ? Number(pricing.maxPointsAllowed) : undefined,
    walletUsed: Number(pricing?.walletUsed || 0),
    walletDiscount,
    userPointsBalance: pricing?.userPointsBalance !== undefined ? Number(pricing.userPointsBalance) : undefined,
    userWalletBalance: pricing?.userWalletBalance !== undefined ? Number(pricing.userWalletBalance) : undefined,
    total: effectiveTotal, 
    coupon: rawPromoCode, 
    appliedCoupon: rawPromoCode,
    pendingCoupon: coupon,
    couponError: promoError,
    isValid: pricing?.isValid !== false,
    errors: pricing?.errors || [],
    loading,
    isUpdating,
    error 
  };
}
