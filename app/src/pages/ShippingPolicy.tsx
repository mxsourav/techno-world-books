import { Link } from 'react-router';
import { Truck, Zap, Package, Mail, Phone } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SEOHead
        title="Shipping & Delivery Policy | Techno World Books"
        description="Delivery timelines, shipping rates, and India Post Speed Post coverage across 27,000+ pincodes in India from Techno World Books."
        canonicalUrl="/shipping-policy"
      />
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 mb-8">
        <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-wider mb-2">
          <Truck className="h-4 w-4 text-emerald-800" /> Logistics & Delivery
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Shipping & Delivery Policy</h1>
        <p className="text-sm text-stone-500 mt-2">
          Nationwide delivery across 27,000+ Indian pincodes via India Post & local on-demand couriers
        </p>
      </div>

      {/* 3 Delivery Options */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
            <Package className="h-4 w-4 text-stone-700" />
            <span>Standard Delivery</span>
          </div>
          <p className="text-base font-semibold text-stone-900 font-mono">₹69 <span className="text-[11px] font-normal text-stone-500">(FREE ₹999+)</span></p>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Reliable delivery across all Indian states. Estimated transit: 5–7 business days.
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
            <Truck className="h-4 w-4 text-stone-700" />
            <span>Speed Post</span>
          </div>
          <p className="text-base font-semibold text-stone-900 font-mono">₹199 Flat</p>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            High-priority inland parcel booked via India Post network with SMS tracking. 2–3 days.
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
            <Zap className="h-4 w-4 text-stone-700" />
            <span>Local Express</span>
          </div>
          <p className="text-base font-semibold text-stone-900 font-mono">₹149 Flat</p>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            On-demand dispatch (Porter/Rapido) for Kolkata & Howrah. Same-day priority.
          </p>
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Daily 2:00 PM Dispatch Batch & Consolidation</h2>
          <p>
            Orders placed before 2:00 PM IST on working days (Monday to Saturday) are handed over to India Post in our daily 2:00 PM dispatch batch.
          </p>
          <p>
            <b>Same-Batch Free Add-on Shipping:</b> If you place an additional order to the same delivery address before today&apos;s 2:00 PM dispatch, your second order will be consolidated into your parcel with <b>₹0 delivery charge</b> automatically! (Applies to standard delivery).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Non-Refundable Delivery Refusal & RTO Policy</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">
              Refusal of Delivery Notice:
            </p>
            <p className="leading-relaxed">
              Once an order has been dispatched from our College Street warehouse, it cannot be recalled or cancelled. If a customer refuses to accept the parcel from the postal carrier or courier agent, leading to an RTO (Return to Origin), <b>no refund will be provided</b>.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Tracking Your Parcel</h2>
          <p>
            Immediately upon dispatch, you will receive an automated email notification with your official <b>India Post tracking number</b> (e.g. <code>EB...IN</code> for Speed Post or parcel article code) or courier partner details.
          </p>
          <p>
            You can also track your shipment status anytime directly via our website at{' '}
            <Link to="/track" className="font-bold text-emerald-700 hover:underline">
              Track Order Page
            </Link>
            .
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">4. Undelivered or Lost Packages</h2>
          <p>
            If your package is delayed, missing, or marked as delivered but not received:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-2">
            <li>Please wait <b>24–48 hours</b> after the expected delivery date.</li>
            <li>Contact us at <a href="mailto:support@technoworldbooks.in" className="font-semibold text-emerald-700 hover:underline">support@technoworldbooks.in</a> with your order number for assistance.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">5. Incorrect Shipping Address</h2>
          <p className="leading-relaxed text-slate-700">
            Please ensure your shipping details are accurate. We are not responsible for orders delivered to the wrong address due to incorrect information provided during checkout.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-5">
          <h2 className="text-base font-bold text-emerald-950">Shipping Support &amp; Queries</h2>
          <p className="text-xs text-emerald-900/80">
            If you have any questions or concerns regarding your shipment, feel free to reach our College Street support team:
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 text-xs font-medium text-slate-800">
            <a
              href="mailto:support@technoworldbooks.in"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 border border-stone-200 text-stone-800 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-2xs"
            >
              <Mail className="h-3.5 w-3.5 text-emerald-700" />
              <span>Email: support@technoworldbooks.in</span>
            </a>
            <a
              href="tel:+917479135626"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 border border-stone-200 text-stone-800 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-2xs"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-700" />
              <span>Phone: +91 747 913 5626</span>
            </a>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold">
        <Link to="/terms" className="text-emerald-700 hover:underline">Read Terms of Service →</Link>
        <Link to="/refund-policy" className="text-emerald-700 hover:underline">Read Refund & Replacement Policy →</Link>
        <Link to="/contact" className="text-emerald-700 hover:underline">Contact Support →</Link>
      </div>
    </div>
  );
}
