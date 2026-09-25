import { useState, useEffect, useRef } from 'react';
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

    const timeout = setTimeout(loadPricing, 400);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [cart, coupon, user, pincode, addressId, JSON.stringify(address), shippingMethod, paymentMethod, pointsUsed, walletUsed]);

  const rawPromoCode = pricing?.promotionCode || pricing?.couponCode || null;
  const promoError = pricing?.promotionError || pricing?.couponError || null;
  const discount = Number(pricing?.promotionDiscount ?? pricing?.couponDiscount ?? 0);

  const effectiveCodFee = paymentMethod === 'cod' ? Number(pricing?.codFee || 20) : 0;
  const baseTotal = Number(pricing?.totalAmount || 0);
  const pricingHadCod = Number(pricing?.codFee || 0) > 0;
  const effectiveTotal = (paymentMethod === 'cod' && !pricingHadCod && baseTotal > 0)
    ? Number((Number(baseTotal || 0) + 20).toFixed(2))
    : Number(baseTotal || 0);

  return { 
    items: pricing?.items || [], 
    subtotal: pricing?.subtotal || 0, 
    mrpTotal: pricing?.mrpTotal || 0, 
    shipping: pricing?.shippingCharge || 0, 
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
    pointsDiscount: Number(pricing?.pointsDiscount || 0),
    walletUsed: Number(pricing?.walletUsed || 0),
    walletDiscount: Number(pricing?.walletDiscount || 0),
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
