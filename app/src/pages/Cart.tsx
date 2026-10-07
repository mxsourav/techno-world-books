import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, ShoppingBag, Tag, Truck, ArrowRight, Heart, Loader2, AlertCircle } from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { useStore } from '@/store/StoreContext';
import { BookCover } from '@/components/BookCover';
import { BookRow } from '@/components/BookCard';
import { bookService } from '@/services/api';
import type { Book } from '@/types';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';

import { useCartTotals } from '@/hooks/useCartTotals';

export default function Cart() {
  const { removeFromCart, setQty, saveForLater, applyCoupon, clearCoupon, savedForLater, moveToCart } = useStore();
  const { items, subtotal, mrpTotal, shipping, discount, total, appliedCoupon, loading, error, couponError, isValid, errors } = useCartTotals();
  const [code, setCode] = useState('');
  const [fbt, setFbt] = useState<Book[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    bookService.getBooks({ bestSeller: true, limit: 8 }).then(res => setFbt(res.data || [])).catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-700">Error Loading Cart</h2>
        <p className="text-sm mt-2">{error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 transition-colors px-6 py-2 font-bold text-white cursor-pointer">Retry</button>
      </div>
    );
  }

  if (items?.length === 0 && savedForLater?.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <SEOHead
          title="Shopping Cart | Techno World Books"
          description="View and manage books in your shopping cart."
          noIndex={true}
        />
        <ShoppingBag className="mx-auto h-16 w-16 text-stone-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-stone-500">Browse best sellers, exam books and new releases.</p>
        <Link to="/" className="mt-5 inline-block rounded-md bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors shadow-xs">Start Shopping</Link>
        <div className="mt-8 text-left"><BookRow title="Best Sellers" books={fbt} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <SEOHead
        title="Shopping Cart | Techno World Books"
        description="View and manage books in your shopping cart."
        noIndex={true}
      />
      <h1 className="mb-4 font-serif text-2xl font-bold text-stone-900 tracking-tight">Shopping Cart <span className="text-base font-sans font-normal text-stone-500">({items?.length} item{items?.length !== 1 ? 's' : ''})</span></h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((i: any) => (
            <div key={i.bookId} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
              <Link to={`/book/${i.slug}`} className="w-20 shrink-0 sm:w-24">
                <BookCover book={{ coverUrl: i.coverUrl, title: i.title } as Book} className="text-[9px]" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/book/${i.slug}`} className="line-clamp-2 text-sm font-semibold text-stone-900 hover:text-emerald-800 transition-colors">{i.title}</Link>
                <p className="text-xs text-stone-500 mt-0.5">{i.author}</p>
                <p className="mt-1.5 text-xs text-stone-500">
                  Delivery by <b className="font-semibold text-stone-800">{new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</b>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-md border border-stone-300 bg-stone-50">
                    <button onClick={() => setQty(i.bookId, i.quantity - 1)} className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors">−</button>
                    <span className="w-7 text-center text-xs font-semibold text-stone-900">{i.quantity}</span>
                    <button onClick={() => setQty(i.bookId, i.quantity + 1)} className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors">+</button>
                  </div>
                  <button onClick={() => { saveForLater(i.bookId); toast.info('Saved for later'); }} className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors">
                    <Heart className="h-3.5 w-3.5" /> Save for later
                  </button>
                  <button onClick={() => removeFromCart(i.bookId)} className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-rose-600 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-stone-900">{formatINR(i.totalPrice)}</p>
                <p className="text-xs text-stone-400 line-through">{formatINR(i.totalMrp)}</p>
              </div>
            </div>
          ))}

          {savedForLater?.length > 0 && (
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
              <p className="mb-3 text-sm font-semibold text-stone-900">Saved for later ({savedForLater?.length})</p>
              {savedForLater.map((i: any) => (
                <div key={i.bookId} className="flex items-center gap-3 border-t border-stone-100 py-3 first:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-stone-800">Book ID: {i.bookId}</p>
                    <p className="text-xs font-medium text-stone-600">Qty: {i.qty}</p>
                  </div>
                  <button onClick={() => moveToCart(i.bookId)} className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors">Move to cart</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* price summary */}
        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:sticky lg:top-36">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Price Details</p>
          {appliedCoupon ? (
            <div className="mb-3 flex flex-col gap-2 rounded-md bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-stone-800">
                  <Tag className="h-3.5 w-3.5 text-emerald-800" /> Coupon &ldquo;{appliedCoupon}&rdquo; applied ({formatINR(discount)} OFF)
                </span>
                <button onClick={clearCoupon} className="font-semibold text-stone-600 hover:text-rose-600 underline transition-colors">Remove</button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div className="flex gap-2">
                <input 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  placeholder="Enter coupon code (e.g. TEST20)" 
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-xs outline-none focus:border-stone-900 font-mono uppercase" 
                />
                <button
                  onClick={() => { 
                    if (!code.trim()) return toast.error('Please enter a coupon code');
                    applyCoupon(code.trim()); 
                  }}
                  className="rounded-md bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shrink-0"
                >Apply</button>
              </div>
              {couponError ? (
                <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-stone-500">Have a promo code? Enter it above.</p>
              )}
            </div>
          )}
          <dl className="space-y-2 border-b border-dashed border-stone-200 pb-3 text-sm">
            <div className="flex justify-between"><dt className="text-stone-600">Price ({items.reduce((s: number, i: any) => s + (i.quantity || 1), 0)} items)</dt><dd className="font-medium text-stone-900">{formatINR(mrpTotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-600">Book discount</dt><dd className="font-medium text-emerald-800">− {formatINR(mrpTotal - subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between"><dt className="text-stone-600">Coupon savings</dt><dd className="font-medium text-emerald-800">− {formatINR(discount)}</dd></div>}
            <div className="flex justify-between">
              <dt className="flex items-center gap-1 text-stone-600"><Truck className="h-3.5 w-3.5" /> Delivery</dt>
              <dd>{shipping === 0 ? <span className="font-semibold text-emerald-800">FREE</span> : <span className="font-medium text-stone-900">{formatINR(shipping)}</span>}</dd>
            </div>
          </dl>
          <div className="mt-3 flex justify-between text-base font-bold text-stone-900"><span>Total</span><span>{formatINR(total)}</span></div>
          <p className="mt-1.5 text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200 rounded-md px-2.5 py-1 text-center">
            You save {formatINR(mrpTotal - subtotal + discount)} on this order
          </p>
          {errors && errors?.length > 0 && (
            <div className="mt-3 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <ul className="list-inside list-disc">
                {errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          <button
            onClick={() => navigate('/checkout')}
            disabled={items?.length === 0 || !isValid}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>

      <div className="mt-6"><BookRow title="Frequently bought together" books={fbt} /></div>
    </div>
  );
}
