import { Link, useLocation } from 'react-router';
import { CheckCircle2, ChevronRight, Package, Truck, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function OrderSuccess() {
  const location = useLocation();
  const orderNumber = new URLSearchParams(location.search).get('id') || 'TW-12345678-9012';

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <SEOHead
        title="Order Placed Successfully | Techno World Books"
        description="Your order has been placed successfully."
        noIndex={true}
      />
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-stone-100 border border-stone-200 p-3">
          <CheckCircle2 className="h-16 w-16 text-emerald-800" />
        </div>
      </div>
      <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-900 sm:text-4xl">
        Order Placed Successfully
      </h1>
      <p className="mt-4 text-base text-stone-600">
        Thank you for your purchase. We've received your order <b className="text-stone-900">#{orderNumber}</b> and will begin processing it right away.
      </p>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row justify-around gap-6 items-center">
        <div className="flex flex-col items-center text-stone-800">
          <CheckCircle2 className="h-8 w-8 text-emerald-800 mb-2" />
          <span className="font-semibold text-sm">Order Confirmed</span>
        </div>
        <ChevronRight className="h-5 w-5 text-stone-300 hidden sm:block" />
        <div className="flex flex-col items-center text-stone-400">
          <Package className="h-8 w-8 mb-2" />
          <span className="font-medium text-sm">Processing</span>
        </div>
        <ChevronRight className="h-5 w-5 text-stone-300 hidden sm:block" />
        <div className="flex flex-col items-center text-stone-400">
          <Truck className="h-8 w-8 mb-2" />
          <span className="font-medium text-sm">Shipped</span>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/my-orders" className="inline-flex items-center justify-center rounded-md bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors">
          View My Orders
        </Link>
        <Link to="/" className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors">
          Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
